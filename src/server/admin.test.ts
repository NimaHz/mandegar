import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { eq, inArray } from "drizzle-orm";
import { generate } from "otplib";
import sharp from "sharp";

import { hashPassword } from "@/server/auth/password";
import { closeDb, getDb } from "@/server/db/client";
import {
  auditLogs,
  brands,
  categories,
  media,
  products,
  users,
  warrantyCodes,
} from "@/server/db/schema";
import { loadEnvFiles } from "@/server/load-env-files";
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
