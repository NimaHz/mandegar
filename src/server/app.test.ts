import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { count, eq, inArray, sql } from "drizzle-orm";

import { mentionsGasSmell } from "@/lib/tickets";
import { createTrackingCode } from "@/lib/tracking-code";
import { createWarrantyCode, formatWarrantyCode } from "@/lib/warranty-code";
import { closeDb, getDb } from "@/server/db/client";
import {
  brands,
  categories,
  contactMessages,
  media,
  notificationOutbox,
  products,
  ticketMessages,
  tickets,
  warrantyCodes,
  warrantyPolicies,
} from "@/server/db/schema";
import { foldSearch, toFoldedKey } from "@/server/db/search";
import { randomToken, sha256 } from "@/server/lib/crypto";
import { isUniqueViolation } from "@/server/lib/db-errors";
import { issueFormToken } from "@/server/lib/form-guard";
import { getStorage } from "@/server/storage";
import { field, loadTestEnv, postJson, request, testIp } from "@/server/testing/http";
import { warrantyService } from "@/services/db/warranty";

process.env.ALTCHA_COST = "1";
loadTestEnv();

const suffix = Date.now().toString(36);
const phone = `0912${String(Date.now()).slice(-7)}`;
const fixture = { categoryId: "", brandId: "", productId: "", policyId: "", code: "" };

const solveAltcha = async (ip: string) => {
  const { json: challenge } = await request("/altcha/challenge", { ip });
  assert.ok(challenge && typeof challenge === "object");
  const solution = await solveChallenge({
    challenge: challenge as Parameters<typeof solveChallenge>[0]["challenge"],
    deriveKey,
  });
  assert.ok(solution);
  return Buffer.from(JSON.stringify({ challenge, solution })).toString("base64");
};

const createFixtures = async () => {
  const db = getDb();
  const text = { fa: "آزمون", en: "Test" };
  const [category] = await db
    .insert(categories)
    .values({
      slug: `test-category-${suffix}`,
      name: text,
      summary: text,
      description: text,
      icon: "fan",
    })
    .returning();
  const [brand] = await db
    .insert(brands)
    .values({ slug: `test-brand-${suffix}`, name: text, description: text })
    .returning();
  assert.ok(category && brand);
  const [product] = await db
    .insert(products)
    .values({
      slug: `test-product-${suffix}`,
      modelCode: `TST-${suffix}`.toUpperCase(),
      categoryId: category.id,
      brandId: brand.id,
      status: "published",
      name: { fa: "محصول آزمایشی", en: "Test product" },
      tagline: text,
      summary: text,
      description: text,
      publishedAt: new Date(),
    })
    .returning();
  const [policy] = await db
    .insert(warrantyPolicies)
    .values({
      name: { fa: `آزمون ${suffix}`, en: `Test ${suffix}` },
      months: 18,
      startRule: text,
      effectiveFrom: "2024-01-01",
    })
    .returning();
  assert.ok(product && policy);
  const code = createWarrantyCode(1405);
  await db
    .insert(warrantyCodes)
    .values({ code, productId: product.id, productionYear: 1405, policyId: policy.id });
  Object.assign(fixture, {
    categoryId: category.id,
    brandId: brand.id,
    productId: product.id,
    policyId: policy.id,
    code,
  });
};

const removeTicketMedia = async (ids: string[]) => {
  if (ids.length === 0) return;
  const rows = await getDb()
    .delete(media)
    .where(inArray(media.id, ids))
    .returning({ storageKey: media.storageKey });
  const storage = await getStorage();
  await Promise.all(rows.map((row) => storage.remove(row.storageKey)));
};

const removeFixtures = async () => {
  const db = getDb();
  const attachments = await db
    .select({ ids: ticketMessages.attachmentMediaIds })
    .from(ticketMessages)
    .innerJoin(tickets, eq(tickets.id, ticketMessages.ticketId))
    .where(eq(tickets.phone, phone));
  await db.delete(tickets).where(eq(tickets.phone, phone));
  await removeTicketMedia(attachments.flatMap((row) => row.ids));
  await db.delete(contactMessages).where(eq(contactMessages.phone, phone));
  await db.delete(warrantyCodes).where(eq(warrantyCodes.productId, fixture.productId));
  await db.delete(warrantyPolicies).where(eq(warrantyPolicies.id, fixture.policyId));
  await db.delete(products).where(eq(products.id, fixture.productId));
  await db.delete(brands).where(inArray(brands.id, [fixture.brandId]));
  await db.delete(categories).where(eq(categories.id, fixture.categoryId));
};

before(createFixtures);
after(async () => {
  await removeFixtures();
  await closeDb();
});

describe("health and search", () => {
  it("reports degraded while the server environment is invalid", async (t) => {
    const errors = t.mock.method(console, "error", () => undefined);
    const cost = process.env.ALTCHA_COST;
    process.env.ALTCHA_COST = "2k";
    try {
      const response = await request("/health");
      assert.equal(response.status, 503);
      assert.equal(field(response.json, "status"), "degraded");
      assert.equal(field(response.json, "configuration"), false);
      assert.equal(field(response.json, "database"), true);
      assert.match(String(errors.mock.calls[0]?.arguments[0]), /ALTCHA_COST/);
    } finally {
      process.env.ALTCHA_COST = cost;
    }
  });

  it("reports healthy", async () => {
    const response = await request("/health");
    assert.equal(response.status, 200);
    assert.equal(field(response.json, "status"), "ok");
    assert.equal(field(response.json, "configuration"), true);
  });

  it("returns localized hits and nothing for an empty query", async () => {
    const hits = await request(`/search?q=TST-${suffix}&locale=en`, { ip: testIp() });
    assert.equal(hits.status, 200);
    const list = field(hits.json, "hits");
    assert.ok(Array.isArray(list));
    assert.equal(field(list[0], "href"), `/en/products/test-product-${suffix}`);
    const empty = await request("/search?q=", { ip: testIp() });
    assert.deepEqual(empty.json, { hits: [] });
  });

  it("drops NUL bytes from query strings instead of failing in the database", async () => {
    const hits = await request(`/search?q=TST%00-${suffix}&locale=en`, { ip: testIp() });
    assert.equal(hits.status, 200, JSON.stringify(hits.json));
    const list = field(hits.json, "hits");
    assert.ok(Array.isArray(list));
    assert.equal(field(list[0], "href"), `/en/products/test-product-${suffix}`);
    const lookup = await request(`/products?slugs=test-product-${suffix}%00&locale=en`, {
      ip: testIp(),
    });
    assert.equal(lookup.status, 200, JSON.stringify(lookup.json));
    const items = field(lookup.json, "items");
    assert.ok(Array.isArray(items));
    assert.deepEqual(
      items.map((item) => field(item, "slug")),
      [`test-product-${suffix}`],
    );
  });

  it("folds stored text exactly like the query key", async () => {
    const samples = [
      "معمولاً نصب",
      "کولر\u00a0آبی",
      "کولر\u200fآبی\u200e",
      "بخاري\tگازی\nكوچك",
      "ـفن‌کویلـ MEH-2000",
      "۱۲۳٤ Fan",
    ];
    for (const sample of samples) {
      const [row] = await getDb().execute<{ key: string }>(
        sql`select ${foldSearch(sql`${sample}::text`)} as key`,
      );
      assert.equal(row?.key, toFoldedKey(sample), JSON.stringify(sample));
    }
  });
});

describe("product lookup", () => {
  it("returns visible products for the requested slugs only", async () => {
    const response = await request(
      `/products?slugs=test-product-${suffix},missing-${suffix}&locale=en`,
      { ip: testIp() },
    );
    assert.equal(response.status, 200);
    const items = field(response.json, "items");
    assert.ok(Array.isArray(items));
    assert.deepEqual(
      items.map((item) => field(item, "slug")),
      [`test-product-${suffix}`],
    );
    const empty = await request("/products?slugs=&locale=fa", { ip: testIp() });
    assert.deepEqual(empty.json, { items: [] });
  });
});

describe("warranty lookup", () => {
  it("finds a code typed with dashes and lowercase", async () => {
    const response = await postJson(
      "/warranty/lookup",
      { code: formatWarrantyCode(fixture.code).toLowerCase(), locale: "en" },
      { ip: testIp() },
    );
    assert.equal(response.status, 200);
    assert.equal(field(response.json, "status"), "found");
    const match = field(response.json, "match");
    assert.equal(field(match, "productionYear"), 1405);
    assert.equal(field(field(match, "product"), "slug"), `test-product-${suffix}`);
  });

  it("keeps codes of archived or hidden products valid but unlinked", async () => {
    const lookup = async () => {
      const response = await postJson(
        "/warranty/lookup",
        { code: fixture.code, locale: "en" },
        { ip: testIp() },
      );
      return response.json;
    };
    const db = getDb();
    try {
      await db
        .update(products)
        .set({ status: "archived" })
        .where(eq(products.id, fixture.productId));
      const archived = await lookup();
      assert.equal(field(archived, "status"), "found");
      const product = field(field(archived, "match"), "product");
      assert.equal(field(product, "listed"), false);
      assert.equal(field(field(product, "category"), "listed"), true);
      await db
        .update(products)
        .set({ status: "published" })
        .where(eq(products.id, fixture.productId));
      await db.update(brands).set({ published: false }).where(eq(brands.id, fixture.brandId));
      const hidden = await lookup();
      assert.equal(field(hidden, "status"), "found");
      assert.equal(field(field(field(hidden, "match"), "product"), "listed"), false);
      await db.update(brands).set({ published: true }).where(eq(brands.id, fixture.brandId));
      await db.update(products).set({ status: "draft" }).where(eq(products.id, fixture.productId));
      assert.deepEqual(await lookup(), { status: "not-found" });
    } finally {
      await db.update(brands).set({ published: true }).where(eq(brands.id, fixture.brandId));
      await db
        .update(products)
        .set({ status: "published" })
        .where(eq(products.id, fixture.productId));
    }
    assert.equal(field(field(field(await lookup(), "match"), "product"), "listed"), true);
  });

  it("returns an identical response for every miss", async () => {
    const ip = testIp();
    const first = await postJson(
      "/warranty/lookup",
      { code: createWarrantyCode(1405), locale: "fa" },
      { ip },
    );
    const second = await postJson(
      "/warranty/lookup",
      { code: createWarrantyCode(1404), locale: "en" },
      { ip },
    );
    assert.deepEqual(first.json, { status: "not-found" });
    assert.deepEqual(second.json, first.json);
  });

  it("explains invalid codes and rate-limits repeated failures", async () => {
    const ip = testIp();
    const invalid = await postJson("/warranty/lookup", { code: "W12", locale: "fa" }, { ip });
    assert.deepEqual(invalid.json, { status: "invalid", reason: "length" });
    for (let attempt = 0; attempt < 10; attempt += 1) {
      await postJson("/warranty/lookup", { code: createWarrantyCode(1405), locale: "fa" }, { ip });
    }
    const limited = await postJson(
      "/warranty/lookup",
      { code: fixture.code, locale: "fa" },
      { ip },
    );
    assert.deepEqual(limited.json, { status: "rate-limited" });
  });

  it("counts concurrent misses atomically and ignores hits", async () => {
    const ip = testIp();
    const misses = await Promise.all(
      Array.from({ length: 15 }, () =>
        postJson("/warranty/lookup", { code: createWarrantyCode(1405), locale: "fa" }, { ip }),
      ),
    );
    const outcomes = misses.map((response) => String(field(response.json, "status")));
    assert.equal(outcomes.filter((status) => status === "not-found").length, 10);
    assert.equal(outcomes.filter((status) => status === "rate-limited").length, 5);
    const hitsIp = testIp();
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const hit = await postJson("/warranty/lookup", { code: fixture.code }, { ip: hitsIp });
      assert.equal(field(hit.json, "status"), "found");
    }
  });

  it("answers malformed bodies with 400 and wrong content types with 415", async () => {
    const malformed = await request("/warranty/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{bad",
      ip: testIp(),
    });
    assert.equal(malformed.status, 400);
    assert.equal(field(field(malformed.json, "error"), "code"), "BAD_REQUEST");
    const wrongType = await postJson("/tickets", {}, { ip: testIp() });
    assert.equal(wrongType.status, 415);
    assert.equal(field(field(wrongType.json, "error"), "code"), "UNSUPPORTED_MEDIA");
  });

  it("rejects cross-origin writes", async () => {
    const { app } = await import("@/server/app");
    const response = await app.handle(
      new Request("http://localhost:3000/api/warranty/lookup", {
        method: "POST",
        headers: { "content-type": "application/json", origin: "https://evil.example" },
        body: JSON.stringify({ code: fixture.code }),
      }),
    );
    assert.equal(response.status, 403);
  });

  it("lists only the current version of each plan, named in the reader's language", async () => {
    const db = getDb();
    const text = { fa: "آزمون", en: "Test" };
    const months = 97;
    const plan = (label: string, effectiveFrom: string) => ({
      name: { fa: `${label} ${suffix}`, en: `${label} ${suffix} en` },
      months,
      startRule: text,
      effectiveFrom,
    });
    const versions = await db
      .insert(warrantyPolicies)
      .values([
        plan("old", "2024-01-01"),
        plan("current", "2025-01-01"),
        plan("next", "2999-01-01"),
      ])
      .returning({ id: warrantyPolicies.id });
    const ids = versions.map((row) => row.id);
    try {
      const [fa, en] = await Promise.all([
        warrantyService.policies("fa"),
        warrantyService.policies("en"),
      ]);
      const listed = fa.filter((policy) => policy.months === months);
      assert.deepEqual(
        listed.map((policy) => [policy.id, policy.name]),
        [[ids[1], `current ${suffix}`]],
      );
      assert.deepEqual(
        en.filter((policy) => policy.months === months).map((policy) => policy.name),
        [`current ${suffix} en`],
      );
    } finally {
      await db.delete(warrantyPolicies).where(inArray(warrantyPolicies.id, ids));
    }
  });
});

describe("tickets", () => {
  const ip = testIp();
  const state = { trackingCode: "", accessToken: "" };

  it("creates a ticket with an attachment and flags gas smell as urgent", async () => {
    const form = new FormData();
    const fields = {
      type: "warranty-repair",
      name: "Test Customer",
      phone,
      province: "23",
      city: "Tehran",
      address: "Test street, number 1",
      warrantyCode: formatWarrantyCode(fixture.code),
      subject: "بوی گاز از بخاری",
      description: "از دیروز بوی گاز در اتاق حس می‌شود.",
      website: "",
      formToken: issueFormToken(Date.now() - 5_000),
      altcha: await solveAltcha(ip),
      locale: "fa",
    };
    for (const [key, value] of Object.entries(fields)) form.set(key, value);
    const pdf = new TextEncoder().encode("%PDF-1.4\n1 0 obj << >> endobj\ntrailer << >>\n%%EOF\n");
    form.append("attachments", new File([pdf], "invoice.pdf", { type: "application/pdf" }));
    const response = await request("/tickets", { method: "POST", body: form, ip });
    assert.equal(response.status, 200, JSON.stringify(response.json));
    assert.equal(field(response.json, "urgent"), true);
    state.trackingCode = String(field(response.json, "trackingCode"));
    state.accessToken = String(field(response.json, "accessToken"));
    const [row] = await getDb()
      .select()
      .from(tickets)
      .where(eq(tickets.trackingCode, state.trackingCode));
    assert.equal(row?.priority, "urgent");
    assert.equal(row?.productId, fixture.productId);
    assert.ok(row && row.firstResponseDue > row.createdAt);
  });

  it("rejects future purchase dates and oversize attachments", async () => {
    const form = () => {
      const data = new FormData();
      const fields = {
        type: "repair",
        name: "Test Customer",
        phone,
        province: "23",
        city: "Tehran",
        address: "Test street, number 1",
        subject: "Noisy fan",
        description: "The fan is louder than before.",
        formToken: "unused",
        altcha: "unused",
      };
      for (const [key, value] of Object.entries(fields)) data.set(key, value);
      return data;
    };
    const future = form();
    future.set("purchaseDate", "2999-01-01");
    const dated = await request("/tickets", { method: "POST", body: future, ip: testIp() });
    assert.equal(dated.status, 422);
    assert.ok(field(field(field(dated.json, "error"), "fields"), "purchaseDate"));
    const heavy = form();
    heavy.append(
      "attachments",
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], "photo.jpg", { type: "image/jpeg" }),
    );
    const large = await request("/tickets", { method: "POST", body: heavy, ip: testIp() });
    assert.equal(large.status, 413);
    assert.equal(field(field(large.json, "error"), "code"), "PAYLOAD_TOO_LARGE");
  });

  it("rejects a filled honeypot", async () => {
    const response = await postJson(
      "/contact",
      {
        department: "general",
        name: "Bot",
        phone,
        subject: "Hello",
        body: "Spam message body",
        formToken: issueFormToken(Date.now() - 5_000),
        altcha: "e30=",
        website: "https://spam.example",
      },
      { ip },
    );
    assert.equal(response.status, 400);
    assert.equal(field(field(response.json, "error"), "code"), "SPAM_REJECTED");
  });

  it("tracks by code and phone with a masked phone and no reply rights", async () => {
    const response = await postJson(
      "/tickets/track",
      {
        trackingCode: state.trackingCode.toLowerCase(),
        phone: `+98${phone.slice(1)}`,
        locale: "en",
      },
      { ip },
    );
    assert.equal(response.status, 200);
    assert.equal(field(response.json, "maskedPhone"), `${phone.slice(0, 4)}***${phone.slice(-4)}`);
    assert.equal(field(response.json, "canReply"), false);
    assert.equal(field(response.json, "warrantyCode"), formatWarrantyCode(fixture.code));
  });

  it("hides tickets behind a wrong phone", async () => {
    const response = await postJson(
      "/tickets/track",
      { trackingCode: state.trackingCode, phone: "09000000000", locale: "fa" },
      { ip },
    );
    assert.equal(response.status, 404);
  });

  it("lets the customer reply with the access token", async () => {
    const form = new FormData();
    form.set("token", state.accessToken);
    form.set("body", "Any news?");
    const response = await request(`/tickets/${state.trackingCode}/messages`, {
      method: "POST",
      body: form,
      ip,
    });
    assert.equal(response.status, 200);
    assert.equal(field(response.json, "canReply"), true);
    const messages = field(response.json, "messages");
    assert.ok(Array.isArray(messages));
    assert.equal(field(messages.at(-1), "body"), "Any news?");
    assert.ok(messages.every((message) => field(message, "author") !== "system"));
  });

  it("reopens a resolved ticket when the customer replies", async () => {
    await getDb()
      .update(tickets)
      .set({ status: "resolved", resolvedAt: new Date() })
      .where(eq(tickets.trackingCode, state.trackingCode));
    const form = new FormData();
    form.set("token", state.accessToken);
    form.set("body", "It stopped working again.");
    const response = await request(`/tickets/${state.trackingCode}/messages`, {
      method: "POST",
      body: form,
      ip,
    });
    assert.equal(response.status, 200, JSON.stringify(response.json));
    assert.equal(field(response.json, "status"), "in-review");
    const messages = field(response.json, "messages");
    assert.ok(Array.isArray(messages));
    assert.deepEqual(
      messages.slice(-2).map((message) => [field(message, "author"), field(message, "status")]),
      [
        ["customer", undefined],
        ["system", "in-review"],
      ],
    );
    const [row] = await getDb()
      .select({ status: tickets.status, resolvedAt: tickets.resolvedAt })
      .from(tickets)
      .where(eq(tickets.trackingCode, state.trackingCode));
    assert.deepEqual(row, { status: "in-review", resolvedAt: null });
  });

  it("removes stored attachments when a later file is rejected", async () => {
    const name = `kept-${suffix}.pdf`;
    const form = new FormData();
    form.set("token", state.accessToken);
    form.set("body", "Two files, one broken.");
    const pdf = new TextEncoder().encode(`%PDF-1.4\n% ${suffix}\n1 0 obj << >> endobj\n%%EOF\n`);
    form.append("attachments", new File([pdf], name, { type: "application/pdf" }));
    form.append("attachments", new File(["not an image"], "bad.png", { type: "image/png" }));
    const response = await request(`/tickets/${state.trackingCode}/messages`, {
      method: "POST",
      body: form,
      ip,
    });
    assert.equal(response.status, 415);
    const left = await getDb()
      .select({ id: media.id })
      .from(media)
      .where(eq(media.originalName, name));
    assert.deepEqual(left, []);
  });

  it("keeps the open-request limit per phone under concurrent submissions", async () => {
    const burstPhone = `0913${String(Date.now()).slice(-7)}`;
    const prepare = async () => {
      const ip = testIp();
      const form = new FormData();
      const fields = {
        type: "repair",
        name: "Test Customer",
        phone: burstPhone,
        province: "23",
        city: "Tehran",
        address: "Test street, number 1",
        subject: "Noisy fan",
        description: "The fan is louder than before.",
        website: "",
        formToken: issueFormToken(Date.now() - 5_000),
        altcha: await solveAltcha(ip),
        locale: "fa",
      };
      for (const [key, value] of Object.entries(fields)) form.set(key, value);
      return { form, ip };
    };
    try {
      const submissions = await Promise.all(Array.from({ length: 5 }, prepare));
      const responses = await Promise.all(
        submissions.map(({ form, ip }) => request("/tickets", { method: "POST", body: form, ip })),
      );
      assert.deepEqual(
        responses.map((response) => response.status).toSorted((left, right) => left - right),
        [200, 200, 200, 409, 409],
      );
      const [row] = await getDb()
        .select({ total: count() })
        .from(tickets)
        .where(eq(tickets.phone, burstPhone));
      assert.equal(row?.total, 3);
    } finally {
      await getDb().delete(tickets).where(eq(tickets.phone, burstPhone));
      await getDb().delete(notificationOutbox).where(eq(notificationOutbox.recipient, burstPhone));
    }
  });

  it("recognises a tracking-code collision by its real constraint", async () => {
    const values = {
      trackingCode: createTrackingCode(),
      type: "repair" as const,
      name: "Test Customer",
      phone,
      province: "23",
      city: "Tehran",
      address: "Test street, number 1",
      subject: "Collision",
      description: "A ticket that reuses a tracking code.",
      firstResponseDue: new Date(),
      resolutionDue: new Date(),
    };
    await getDb()
      .insert(tickets)
      .values({ ...values, accessTokenHash: sha256(randomToken(32)) });
    const duplicate = await getDb()
      .insert(tickets)
      .values({ ...values, accessTokenHash: sha256(randomToken(32)) })
      .then(() => null)
      .catch((error: unknown) => error);
    assert.ok(duplicate);
    assert.equal(isUniqueViolation(duplicate, tickets.trackingCode.uniqueName), true);
  });

  it("flags gas leak wording in Persian and English", () => {
    for (const text of [
      "بوی گاز می‌آید",
      "نشت گاز داریم",
      "نشتی گاز از شیر",
      "گاز نشت می‌کند",
      "گاز بو می‌دهد",
      "بوی شدید گاز در آشپزخانه",
      "گاز داره نشت می‌کنه",
      "gas leak in the kitchen",
      "it smells like gas",
      "leaking gas near the heater",
      "the gas is leaking",
      "a strong gas odour",
    ]) {
      assert.equal(mentionsGasSmell(text), true, text);
    }
    for (const text of [
      "گاز بوتان",
      "کپسول بوتان گاز",
      "پیلوت خاموش می‌شود",
      "the gas bill is high",
    ]) {
      assert.equal(mentionsGasSmell(text), false, text);
    }
  });

  it("refuses replies with a wrong token", async () => {
    const form = new FormData();
    form.set("token", "x".repeat(43));
    form.set("body", "Hello");
    const response = await request(`/tickets/${state.trackingCode}/messages`, {
      method: "POST",
      body: form,
      ip,
    });
    assert.equal(response.status, 404);
  });
});

describe("contact", () => {
  const ip = testIp();
  const message = {
    department: "sales",
    name: "Test Dealer",
    phone,
    subject: "Becoming a dealer",
    body: "We would like to sell Mandegar products in our city.",
    formToken: "",
    altcha: "",
  };

  it("stores a message after the human checks pass", async () => {
    Object.assign(message, {
      formToken: issueFormToken(Date.now() - 4_000),
      altcha: await solveAltcha(ip),
    });
    const response = await postJson("/contact", message, { ip });
    assert.deepEqual(response.json, { received: true });
  });

  it("rejects a replayed challenge", async () => {
    const response = await postJson("/contact", message, { ip });
    assert.equal(response.status, 403);
    assert.equal(field(field(response.json, "error"), "code"), "CHALLENGE_FAILED");
  });

  it("rejects submissions that arrive too quickly", async () => {
    const response = await postJson(
      "/contact",
      {
        department: "sales",
        name: "Fast Bot",
        phone,
        subject: "Quick",
        body: "Too quick to be human.",
        formToken: issueFormToken(),
        altcha: "e30=",
      },
      { ip: testIp() },
    );
    assert.equal(response.status, 400);
  });

  it("returns field errors for invalid input", async () => {
    const response = await postJson(
      "/contact",
      { department: "nope", phone: "123" },
      { ip: testIp() },
    );
    assert.equal(response.status, 422);
    const fields = field(field(response.json, "error"), "fields");
    assert.ok(fields && typeof fields === "object" && "phone" in fields && "department" in fields);
  });
});
