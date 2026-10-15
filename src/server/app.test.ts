import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { solveChallenge } from "altcha-lib";
import { deriveKey } from "altcha-lib/algorithms/pbkdf2";
import { eq, inArray } from "drizzle-orm";

import { createWarrantyCode, formatWarrantyCode } from "@/lib/warranty-code";
import { closeDb, getDb } from "@/server/db/client";
import {
  brands,
  categories,
  contactMessages,
  products,
  tickets,
  warrantyCodes,
  warrantyPolicies,
} from "@/server/db/schema";
import { issueFormToken } from "@/server/lib/form-guard";
import { loadEnvFiles } from "@/server/load-env-files";
import { field, postJson, request, testIp } from "@/server/testing/http";

process.env.ALTCHA_COST = "1";
loadEnvFiles();

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
    .values({ name: `Test ${suffix}`, months: 18, startRule: text, effectiveFrom: "2024-01-01" })
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

const removeFixtures = async () => {
  const db = getDb();
  await db.delete(tickets).where(eq(tickets.phone, phone));
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
  it("reports healthy", async () => {
    const response = await request("/health");
    assert.equal(response.status, 200);
    assert.equal(field(response.json, "status"), "ok");
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
