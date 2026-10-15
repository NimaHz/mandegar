import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { eq, inArray } from "drizzle-orm";
import { generate } from "otplib";
import sharp from "sharp";

import { createTrackingCode } from "@/lib/tracking-code";
import { hashPassword } from "@/server/auth/password";
import { closeDb, getDb } from "@/server/db/client";
import {
  auditLogs,
  brands,
  categories,
  media,
  products,
  tickets,
  users,
  warrantyCodes,
} from "@/server/db/schema";
import { randomToken, sha256 } from "@/server/lib/crypto";
import { loadEnvFiles } from "@/server/load-env-files";
import { getStorage } from "@/server/storage";
import { field, postJson, request, testIp } from "@/server/testing/http";

loadEnvFiles();

const suffix = Date.now().toString(36);
const password = `Test-password-${suffix}-9`;
const accounts = {
  owner: { email: `owner-${suffix}@test.local`, id: "" },
  support: { email: `support-${suffix}@test.local`, id: "" },
};
const created = {
  categoryId: "",
  brandId: "",
  productId: "",
  mediaId: "",
  ticketId: "",
  attachmentIds: [] as string[],
  userIds: [] as string[],
};

const cookieFrom = (headers: Headers) => {
  const header = headers.get("set-cookie") ?? "";
  const match = /mandegar_sid=([^;]*)/.exec(header);
  return match?.[1] ? `mandegar_sid=${match[1]}` : "";
};

const login = async (email: string, secret = password) => {
  const response = await postJson("/auth/login", { email, password: secret }, { ip: testIp() });
  return { response, cookie: cookieFrom(response.headers) };
};

const errorCode = (json: unknown) => field(field(json, "error"), "code");

before(async () => {
  const passwordHash = await hashPassword(password);
  const rows = await getDb()
    .insert(users)
    .values([
      { name: "Test Owner", email: accounts.owner.email, passwordHash, role: "owner" },
      { name: "Test Support", email: accounts.support.email, passwordHash, role: "support" },
    ])
    .returning({ id: users.id, email: users.email });
  for (const row of rows) {
    if (row.email === accounts.owner.email) accounts.owner.id = row.id;
    else accounts.support.id = row.id;
  }
});

after(async () => {
  const db = getDb();
  const userIds = [accounts.owner.id, accounts.support.id, ...created.userIds].filter(Boolean);
  if (created.productId) await db.delete(products).where(eq(products.id, created.productId));
  if (created.mediaId) await db.delete(media).where(eq(media.id, created.mediaId));
  if (created.brandId) await db.delete(brands).where(eq(brands.id, created.brandId));
  if (created.categoryId) await db.delete(categories).where(eq(categories.id, created.categoryId));
  if (created.ticketId) await db.delete(tickets).where(eq(tickets.id, created.ticketId));
  if (created.attachmentIds.length > 0) {
    const rows = await db
      .delete(media)
      .where(inArray(media.id, created.attachmentIds))
      .returning({ storageKey: media.storageKey });
    const storage = await getStorage();
    await Promise.all(rows.map((row) => storage.remove(row.storageKey)));
  }
  await db.delete(auditLogs).where(inArray(auditLogs.actorId, userIds));
  await db.delete(users).where(inArray(users.id, userIds));
  await closeDb();
});

describe("auth", () => {
  it("logs in, reads the session and logs out", async () => {
    const { response, cookie } = await login(accounts.owner.email);
    assert.equal(response.status, 200);
    assert.equal(field(response.json, "status"), "ok");
    assert.ok(cookie, "session cookie is set");
    const setCookie = response.headers.get("set-cookie") ?? "";
    assert.match(setCookie, /HttpOnly/i);
    assert.match(setCookie, /SameSite=Lax/i);
    assert.match(setCookie, /Path=\//);
    const me = await request("/auth/me", { cookie });
    assert.equal(me.status, 200);
    assert.equal(field(me.json, "email"), accounts.owner.email);
    assert.ok(Array.isArray(field(me.json, "permissions")));
    assert.equal(field(me.json, "sessionId"), undefined);
    const logout = await postJson("/auth/logout", {}, { cookie });
    assert.equal(logout.status, 200);
    const after = await request("/auth/me", { cookie });
    assert.equal(after.status, 401);
  });

  it("answers wrong passwords and unknown emails identically", async () => {
    const wrong = await login(accounts.owner.email, "not-the-password-1");
    const unknown = await login(`nobody-${suffix}@test.local`, "not-the-password-1");
    assert.equal(wrong.response.status, 401);
    assert.deepEqual(wrong.response.json, unknown.response.json);
    assert.equal(errorCode(wrong.response.json), "INVALID_CREDENTIALS");
  });

  it("rotates the session token on login", async () => {
    const first = await login(accounts.owner.email);
    const second = await postJson(
      "/auth/login",
      { email: accounts.owner.email, password },
      { cookie: first.cookie, ip: testIp() },
    );
    const rotated = cookieFrom(second.headers);
    assert.notEqual(rotated, first.cookie);
    assert.equal((await request("/auth/me", { cookie: first.cookie })).status, 401);
    assert.equal((await request("/auth/me", { cookie: rotated })).status, 200);
  });

  it("requires TOTP once enabled and rejects a replayed code", async () => {
    const { cookie } = await login(accounts.support.email);
    const setup = await postJson("/auth/totp/setup", {}, { cookie });
    const secret = String(field(setup.json, "secret"));
    assert.match(String(field(setup.json, "uri")), /^otpauth:\/\/totp\//);
    const code = await generate({ secret });
    assert.equal((await postJson("/auth/totp/enable", { code }, { cookie })).status, 200);
    const pending = await login(accounts.support.email);
    assert.deepEqual(pending.response.json, { status: "totp-required" });
    const replay = await postJson(
      "/auth/login",
      { email: accounts.support.email, password, totp: code },
      { ip: testIp() },
    );
    assert.equal(replay.status, 401);
    await getDb()
      .update(users)
      .set({ totpEnabled: false, totpSecret: null })
      .where(eq(users.id, accounts.support.id));
  });
});

describe("rbac", () => {
  it("lets support read the catalog but not create products", async () => {
    const { cookie } = await login(accounts.support.email);
    assert.equal((await request("/admin/products", { cookie })).status, 200);
    const denied = await postJson("/admin/products", { slug: "nope" }, { cookie });
    assert.equal(denied.status, 403);
    assert.equal(errorCode(denied.json), "FORBIDDEN");
    assert.equal((await request("/admin/users", { cookie })).status, 403);
  });

  it("rejects anonymous admin calls", async () => {
    const response = await request("/admin/stats");
    assert.equal(response.status, 401);
    assert.equal(errorCode(response.json), "UNAUTHORIZED");
  });

  it("forces a password change for new users", async () => {
    const { cookie } = await login(accounts.owner.email);
    const email = `new-${suffix}@test.local`;
    const createdUser = await postJson(
      "/admin/users",
      { name: "New Agent", email, role: "support" },
      { cookie },
    );
    assert.equal(createdUser.status, 200);
    const userId = String(field(field(createdUser.json, "user"), "id"));
    created.userIds.push(userId);
    const temporary = String(field(createdUser.json, "temporaryPassword"));
    const first = await login(email, temporary);
    const blocked = await request("/admin/stats", { cookie: first.cookie });
    assert.equal(errorCode(blocked.json), "PASSWORD_CHANGE_REQUIRED");
    const changed = await postJson(
      "/auth/password",
      { currentPassword: temporary, newPassword: `Fresh-password-${suffix}-7` },
      { cookie: first.cookie },
    );
    assert.equal(changed.status, 200);
    assert.equal(
      (await request("/admin/stats", { cookie: cookieFrom(changed.headers) })).status,
      200,
    );
    const listed = await request("/admin/users?q=new-", { cookie });
    const items = field(listed.json, "items");
    assert.ok(Array.isArray(items));
    assert.ok(
      items.every(
        (item) =>
          field(item, "passwordHash") === undefined && field(item, "totpSecret") === undefined,
      ),
    );
  });
});

describe("catalog administration", () => {
  const text = (fa: string, en: string) => ({ fa, en });

  it("creates a category, brand and product, then audits the mutations", async () => {
    const { cookie } = await login(accounts.owner.email);
    const category = await postJson(
      "/admin/categories",
      {
        slug: `test-cat-${suffix}`,
        parentId: null,
        name: text("دسته آزمایشی", "Test category"),
        summary: text("خلاصه", "Summary"),
        description: text("", ""),
        icon: "fan",
        imageMediaId: null,
        defaultGuideId: null,
        specTemplate: [],
        seo: null,
        sortOrder: 99,
        published: false,
      },
      { cookie },
    );
    assert.equal(category.status, 200, JSON.stringify(category.json));
    created.categoryId = String(field(category.json, "id"));
    const brand = await postJson(
      "/admin/brands",
      {
        slug: `test-brand-${suffix}`,
        name: text("برند آزمایشی", "Test brand"),
        description: text("", ""),
        logoMediaId: null,
        website: null,
        isOwn: false,
        sortOrder: 99,
        published: false,
      },
      { cookie },
    );
    created.brandId = String(field(brand.json, "id"));
    const product = await postJson(
      "/admin/products",
      {
        slug: `test-model-${suffix}`,
        modelCode: `tm-${suffix}`,
        categoryId: created.categoryId,
        brandId: created.brandId,
        status: "draft",
        featured: false,
        isNew: true,
        releaseYear: 2026,
        energyClass: "A",
        name: text("مدل آزمایشی", "Test model"),
        tagline: text("شعار", "Tagline"),
        summary: text("خلاصه", "Summary"),
        description: text("توضیح", "Description"),
        specs: [],
        keyFacts: [],
        features: [],
        downloads: [],
        faqs: [],
        guideId: null,
        warrantyMonths: 18,
        relatedIds: [],
        seo: null,
      },
      { cookie },
    );
    assert.equal(product.status, 200, JSON.stringify(product.json));
    created.productId = String(field(product.json, "id"));
    assert.equal(field(product.json, "modelCode"), `TM-${suffix}`.toUpperCase());
    const duplicate = await postJson(
      "/admin/products",
      { ...(product.json as object), id: undefined, modelCode: `other-${suffix}` },
      { cookie },
    );
    assert.equal(duplicate.status, 422);
    const audit = await request(`/admin/audit?entity=products`, { cookie });
    const entries = field(audit.json, "items");
    assert.ok(Array.isArray(entries));
    assert.ok(
      entries.some(
        (entry) =>
          field(entry, "entityId") === created.productId && field(entry, "action") === "create",
      ),
    );
  });

  it("uploads media, attaches it and refuses to delete it while in use", async () => {
    const { cookie } = await login(accounts.owner.email);
    const png = await sharp({
      create: {
        width: 64,
        height: 48,
        channels: 3,
        background: { r: 200, g: 120, b: Date.now() % 255 },
      },
    })
      .png()
      .toBuffer();
    const form = new FormData();
    form.set("file", new File([new Uint8Array(png)], "test.png", { type: "image/png" }));
    form.set("altFa", "تصویر آزمایشی");
    const upload = await request("/admin/media", { method: "POST", body: form, cookie });
    assert.equal(upload.status, 200, JSON.stringify(upload.json));
    assert.equal(field(upload.json, "mime"), "image/webp");
    created.mediaId = String(field(upload.json, "id"));
    const svg = new FormData();
    svg.set(
      "file",
      new File(['<svg xmlns="http://www.w3.org/2000/svg"/>'], "x.svg", { type: "image/svg+xml" }),
    );
    assert.equal(
      (await request("/admin/media", { method: "POST", body: svg, cookie })).status,
      415,
    );
    const images = await postJson(
      `/admin/products/${created.productId}/images`,
      { images: [{ mediaId: created.mediaId, alt: { fa: "", en: "" }, isPrimary: true }] },
      { cookie, method: "PUT" },
    );
    assert.equal(images.status, 200);
    const refused = await request(`/admin/media/${created.mediaId}`, { method: "DELETE", cookie });
    assert.equal(refused.status, 409);
    assert.equal(errorCode(refused.json), "IN_USE");
  });

  it("generates one batch warranty code per product and year", async () => {
    const { cookie } = await login(accounts.owner.email);
    const generated = await postJson(
      "/admin/warranty-codes/generate",
      { productId: created.productId, productionYear: 1405 },
      { cookie },
    );
    assert.equal(generated.status, 200, JSON.stringify(generated.json));
    assert.match(
      String(field(generated.json, "formatted")),
      /^W5[0-9A-Z]-[0-9A-Z]{3}-[0-9A-Z]{3}$/,
    );
    const again = await postJson(
      "/admin/warranty-codes/generate",
      { productId: created.productId, productionYear: 1405 },
      { cookie },
    );
    assert.equal(again.status, 409);
    const csv = await request(`/admin/warranty-codes/export?productId=${created.productId}`, {
      cookie,
    });
    assert.equal(csv.status, 200);
    assert.match(String(csv.json), /code,formatted,model/);
    await getDb().delete(warrantyCodes).where(eq(warrantyCodes.productId, created.productId));
  });

  it("returns dashboard stats", async () => {
    const { cookie } = await login(accounts.owner.email);
    const stats = await request("/admin/stats", { cookie });
    assert.equal(stats.status, 200);
    assert.equal(typeof field(field(stats.json, "tickets"), "open"), "number");
  });
});

describe("admin list sorting", () => {
  it("sorts products by name and falls back to the default for unknown values", async () => {
    const { cookie } = await login(accounts.owner.email);
    const named = await request("/admin/products?sort=name-asc", { cookie });
    assert.equal(named.status, 200);
    const names = (field(named.json, "items") as unknown[]).map((item) =>
      String(field(field(item, "name"), "fa")),
    );
    assert.deepEqual(
      names,
      names.toSorted((left, right) => left.localeCompare(right, "fa")),
    );
    const fallback = await request("/admin/products?sort=nope", { cookie });
    const recent = await request("/admin/products", { cookie });
    assert.equal(fallback.status, 200);
    assert.deepEqual(fallback.json, recent.json);
  });

  it("orders tickets by the nearest SLA deadline", async () => {
    const { cookie } = await login(accounts.owner.email);
    const response = await request("/admin/tickets?sort=due-asc&open=true", { cookie });
    assert.equal(response.status, 200);
    const dues = (field(response.json, "items") as unknown[]).map((item) =>
      new Date(
        String(
          field(item, "firstRespondedAt")
            ? field(item, "resolutionDue")
            : field(item, "firstResponseDue"),
        ),
      ).getTime(),
    );
    assert.deepEqual(
      dues,
      dues.toSorted((left, right) => left - right),
    );
  });
});

describe("staff ticket replies", () => {
  const token = randomToken(32);
  const shade = () => Math.floor(Math.random() * 256);

  const photo = async (name: string) => {
    const png = await sharp({
      create: {
        width: 40 + Math.floor(Math.random() * 40),
        height: 30,
        channels: 3,
        background: { r: shade(), g: shade(), b: shade() },
      },
    })
      .png()
      .toBuffer();
    return new File([new Uint8Array(png)], name, { type: "image/png" });
  };

  const pdf = (name: string) =>
    new File(
      [new TextEncoder().encode(`%PDF-1.4\n% ${suffix} ${name}\n1 0 obj << >> endobj\n%%EOF\n`)],
      name,
      { type: "application/pdf" },
    );

  const reply = (body: string, internal: boolean, files: File[], cookie: string) => {
    const form = new FormData();
    form.set("body", body);
    form.set("internal", String(internal));
    for (const file of files) form.append("attachments", file);
    return request(`/admin/tickets/${created.ticketId}/messages`, {
      method: "POST",
      body: form,
      cookie,
    });
  };

  const lastMessage = (json: unknown) => {
    const messages = field(json, "messages");
    assert.ok(Array.isArray(messages));
    return messages.at(-1);
  };

  const attachmentsOf = (message: unknown) => {
    const files = field(message, "attachments");
    assert.ok(Array.isArray(files));
    return files;
  };

  before(async () => {
    const now = Date.now();
    const [row] = await getDb()
      .insert(tickets)
      .values({
        trackingCode: createTrackingCode(),
        accessTokenHash: sha256(token),
        type: "repair",
        name: "Test Customer",
        phone: `0935${String(now).slice(-7)}`,
        province: "23",
        city: "Tehran",
        address: "Test street, number 2",
        subject: `Attachment test ${suffix}`,
        description: "The heater does not start after the first cold night.",
        firstResponseDue: new Date(now + 86_400_000),
        resolutionDue: new Date(now + 7 * 86_400_000),
      })
      .returning({ id: tickets.id });
    assert.ok(row);
    created.ticketId = row.id;
  });

  it("stores staff attachments and shows public ones on the customer track page", async () => {
    const { cookie } = await login(accounts.support.email);
    const sent = await reply(
      "Here is the wiring diagram and a photo of the right valve.",
      false,
      [await photo("valve.png"), pdf("wiring.pdf")],
      cookie,
    );
    assert.equal(sent.status, 200, JSON.stringify(sent.json));
    assert.equal(field(sent.json, "status"), "in-review");
    assert.ok(field(sent.json, "firstRespondedAt"));
    const files = attachmentsOf(lastMessage(sent.json));
    created.attachmentIds.push(...files.map((file) => String(field(file, "id"))));
    assert.deepEqual(
      files.map((file) => [field(file, "kind"), field(file, "mime"), field(file, "name")]),
      [
        ["image", "image/webp", "valve.png"],
        ["document", "application/pdf", "wiring.pdf"],
      ],
    );

    const note = await reply(
      "Internal photo of the serial plate.",
      true,
      [await photo("plate.png")],
      cookie,
    );
    assert.equal(note.status, 200, JSON.stringify(note.json));
    const noteMessage = lastMessage(note.json);
    assert.equal(field(noteMessage, "internal"), true);
    const noteFiles = attachmentsOf(noteMessage);
    assert.equal(noteFiles.length, 1);
    created.attachmentIds.push(String(field(noteFiles[0], "id")));

    const tracked = await postJson("/tickets/track", { token, locale: "en" }, { ip: testIp() });
    assert.equal(tracked.status, 200, JSON.stringify(tracked.json));
    const messages = field(tracked.json, "messages");
    assert.ok(Array.isArray(messages));
    assert.ok(
      messages.every((message) => field(message, "body") !== "Internal photo of the serial plate."),
    );
    const staff = messages.find((message) => field(message, "author") === "staff");
    const publicFiles = attachmentsOf(staff);
    assert.deepEqual(
      publicFiles.map((file) => [field(file, "name"), field(file, "mime")]),
      [
        ["valve.png", "image/webp"],
        ["wiring.pdf", "application/pdf"],
      ],
    );
    assert.ok(publicFiles.every((file) => String(field(file, "href")).startsWith("/uploads/")));
    assert.equal(
      messages.flatMap((message) => attachmentsOf(message)).length,
      2,
      "internal attachments stay private",
    );

    const audit = await request(`/admin/audit?entity=tickets`, {
      cookie: (await login(accounts.owner.email)).cookie,
    });
    const entry = (field(audit.json, "items") as unknown[]).find(
      (item) =>
        field(item, "entityId") === created.ticketId && field(item, "action") === "messages",
    );
    assert.ok(entry, "the reply is audited");
  });

  it("still accepts JSON replies without attachments", async () => {
    const { cookie } = await login(accounts.support.email);
    const response = await postJson(
      `/admin/tickets/${created.ticketId}/messages`,
      { body: "Plain JSON follow-up.", internal: false },
      { cookie },
    );
    assert.equal(response.status, 200, JSON.stringify(response.json));
    const message = lastMessage(response.json);
    assert.equal(field(message, "body"), "Plain JSON follow-up.");
    assert.deepEqual(field(message, "attachments"), []);
  });

  it("applies the public attachment rules to staff uploads", async () => {
    const { cookie } = await login(accounts.support.email);
    const text = new File(["just text"], "notes.txt", { type: "text/plain" });
    const rejected = await reply("Unsupported file", false, [text], cookie);
    assert.equal(rejected.status, 415);
    assert.equal(errorCode(rejected.json), "UNSUPPORTED_MEDIA");
    const many = await Promise.all(
      Array.from({ length: 6 }, (_, index) => photo(`extra-${index}.png`)),
    );
    const tooMany = await reply("Too many files", false, many, cookie);
    assert.equal(tooMany.status, 422);
    const bare = await reply("Multipart reply without files", false, [], cookie);
    assert.equal(bare.status, 200);
    const form = new FormData();
    form.set("body", "Missing internal flag");
    const unflagged = await request(`/admin/tickets/${created.ticketId}/messages`, {
      method: "POST",
      body: form,
      cookie,
    });
    assert.equal(unflagged.status, 422);
  });
});
