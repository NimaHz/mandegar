import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";

import { and, asc, count, eq, gte, inArray, like, lt } from "drizzle-orm";
import { generate, generateSecret } from "otplib";
import sharp from "sharp";

import { getEnv } from "@/config/env";
import { createTrackingCode, formatTrackingCode } from "@/lib/tracking-code";
import { createWarrantyCode } from "@/lib/warranty-code";
import { hashPassword } from "@/server/auth/password";
import { closeDb, getDb } from "@/server/db/client";
import {
  auditLogs,
  authors,
  brands,
  categories,
  contactMessages,
  faqs,
  guides,
  heroSlides,
  media,
  notificationOutbox,
  posts,
  productImages,
  products,
  serviceCenters,
  sessions,
  ticketMessages,
  tickets,
  users,
  warrantyCodes,
  warrantyPolicies,
} from "@/server/db/schema";
import { openSecret, randomToken, sealSecret, sha256 } from "@/server/lib/crypto";
import { customerAttachmentHref } from "@/server/modules/tickets/attachments";
import { getStorage } from "@/server/storage";
import { field, loadTestEnv, postJson, request, testIp } from "@/server/testing/http";
import { catalogService } from "@/services/db/catalog";
import { contentService } from "@/services/db/content";

loadTestEnv();

const TEST_EMAIL_PATTERN = "%@test.local";
const STALE_ACCOUNT_MS = 3_600_000;

const randomPassword = () => `${randomToken(24)}-a1`;

const suffix = Date.now().toString(36);
const password = randomPassword();
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
  fixtureTicketIds: [] as string[],
  attachmentIds: [] as string[],
  libraryMediaIds: [] as string[],
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

const addUser = async (
  label: string,
  values: Partial<typeof users.$inferInsert> & Pick<typeof users.$inferInsert, "role">,
) => {
  const email = `${label}-${suffix}@test.local`;
  const [row] = await getDb()
    .insert(users)
    .values({ name: `Test ${label}`, email, passwordHash: await hashPassword(password), ...values })
    .returning({ id: users.id });
  assert.ok(row);
  created.userIds.push(row.id);
  return { id: row.id, email };
};

const insertTicket = async (values: Partial<typeof tickets.$inferInsert> = {}) => {
  const now = Date.now();
  const [row] = await getDb()
    .insert(tickets)
    .values({
      trackingCode: createTrackingCode(),
      accessTokenHash: sha256(randomToken(32)),
      type: "repair",
      name: "Test Customer",
      phone: `0936${String(now).slice(-7)}`,
      province: "23",
      city: "Tehran",
      address: "Test street, number 3",
      subject: `Fixture ticket ${suffix}`,
      description: "A fixture ticket for the admin tests.",
      firstResponseDue: new Date(now + 86_400_000),
      resolutionDue: new Date(now + 7 * 86_400_000),
      ...values,
    })
    .returning({ id: tickets.id });
  assert.ok(row);
  created.fixtureTicketIds.push(row.id);
  return row.id;
};

const purgeStaleTestAccounts = async () => {
  const db = getDb();
  const stale = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        like(users.email, TEST_EMAIL_PATTERN),
        lt(users.createdAt, new Date(Date.now() - STALE_ACCOUNT_MS)),
      ),
    );
  const ids = stale.map((row) => row.id);
  if (ids.length === 0) return;
  await db.delete(auditLogs).where(inArray(auditLogs.actorId, ids));
  await db.delete(users).where(inArray(users.id, ids));
};

before(async () => {
  await purgeStaleTestAccounts();
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
  if (created.brandId) await db.delete(brands).where(eq(brands.id, created.brandId));
  if (created.categoryId) await db.delete(categories).where(eq(categories.id, created.categoryId));
  if (created.ticketId) await db.delete(tickets).where(eq(tickets.id, created.ticketId));
  if (created.fixtureTicketIds.length > 0) {
    await db.delete(tickets).where(inArray(tickets.id, created.fixtureTicketIds));
  }
  const mediaIds = [created.mediaId, ...created.attachmentIds, ...created.libraryMediaIds].filter(
    Boolean,
  );
  if (mediaIds.length > 0) {
    const rows = await db
      .delete(media)
      .where(inArray(media.id, mediaIds))
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

  it("locks out one source without blocking the account", async () => {
    const email = `target-${suffix}@test.local`;
    const [target] = await getDb()
      .insert(users)
      .values({
        name: "Test Target",
        email,
        passwordHash: await hashPassword(password),
        role: "support",
      })
      .returning({ id: users.id });
    assert.ok(target);
    created.userIds.push(target.id);
    const attacker = testIp();
    const burst = await Promise.all(
      Array.from({ length: 10 }, () =>
        postJson("/auth/login", { email, password: "not-the-password-1" }, { ip: attacker }),
      ),
    );
    const statuses = burst.map((response) => response.status).toSorted();
    assert.deepEqual(statuses, [401, 401, 401, 401, 401, 429, 429, 429, 429, 429]);
    const owner = await postJson("/auth/login", { email, password }, { ip: testIp() });
    assert.equal(owner.status, 200);
    const alerts = await getDb()
      .delete(auditLogs)
      .where(eq(auditLogs.entityId, target.id))
      .returning({ action: auditLogs.action });
    assert.ok(alerts.some((alert) => alert.action === "login.throttled"));
  });

  it("requires TOTP once enabled and rejects a replayed code", async () => {
    const { cookie } = await login(accounts.support.email);
    const other = await login(accounts.support.email);
    const setup = await postJson("/auth/totp/setup", {}, { cookie });
    const secret = String(field(setup.json, "secret"));
    assert.match(String(field(setup.json, "uri")), /^otpauth:\/\/totp\//);
    const code = await generate({ secret });
    const unconfirmed = await postJson("/auth/totp/enable", { code }, { cookie });
    assert.equal(unconfirmed.status, 422);
    const wrong = await postJson(
      "/auth/totp/enable",
      { password: "not-the-password-1", code },
      { cookie },
    );
    assert.equal(errorCode(wrong.json), "INVALID_CREDENTIALS");
    assert.equal((await postJson("/auth/totp/enable", { password, code }, { cookie })).status, 200);
    assert.equal((await request("/auth/me", { cookie })).status, 200);
    assert.equal((await request("/auth/me", { cookie: other.cookie })).status, 401);
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

  it("caps wrong second-factor codes per account across every IP", async () => {
    const target = await addUser("totp-cap", {
      role: "support",
      totpEnabled: true,
      totpSecret: sealSecret("JBSWY3DPEHPK3PXP"),
    });
    const guesses = await Promise.all(
      Array.from({ length: 12 }, () =>
        postJson(
          "/auth/login",
          { email: target.email, password, totp: "000000" },
          { ip: testIp() },
        ),
      ),
    );
    assert.deepEqual(guesses.map((response) => response.status).toSorted(), [
      ...Array.from({ length: 10 }, () => 401),
      429,
      429,
    ]);
    await getDb().delete(auditLogs).where(eq(auditLogs.entityId, target.id));
  });

  it("keeps two-factor working across a SESSION_SECRET rotation", async () => {
    const env = getEnv();
    const original = { current: env.SESSION_SECRET, previous: env.SESSION_SECRET_PREVIOUS };
    const secret = generateSecret();
    const sealed = sealSecret(secret);
    const target = await addUser("rotation", {
      role: "support",
      totpEnabled: true,
      totpSecret: sealed,
    });
    try {
      env.SESSION_SECRET = randomToken(48);
      env.SESSION_SECRET_PREVIOUS = undefined;
      assert.equal(openSecret(sealed), null);
      env.SESSION_SECRET_PREVIOUS = original.current;
      assert.deepEqual(openSecret(sealed), { plaintext: secret, stale: true });
      const signedIn = await postJson(
        "/auth/login",
        { email: target.email, password, totp: await generate({ secret }) },
        { ip: testIp() },
      );
      assert.equal(field(signedIn.json, "status"), "ok", JSON.stringify(signedIn.json));
      const [row] = await getDb()
        .select({ totpSecret: users.totpSecret })
        .from(users)
        .where(eq(users.id, target.id));
      env.SESSION_SECRET_PREVIOUS = undefined;
      assert.deepEqual(openSecret(String(row?.totpSecret)), { plaintext: secret, stale: false });
    } finally {
      env.SESSION_SECRET = original.current;
      env.SESSION_SECRET_PREVIOUS = original.previous;
    }
  });

  it("re-asks for the current password at most a few times", async () => {
    const target = await addUser("reauth", { role: "support" });
    const { cookie } = await login(target.email);
    const attempts = await Promise.all(
      Array.from({ length: 6 }, () =>
        postJson(
          "/auth/password",
          { currentPassword: "not-the-password-1", newPassword: randomPassword() },
          { cookie },
        ),
      ),
    );
    assert.deepEqual(
      attempts.map((response) => response.status).toSorted(),
      [401, 401, 401, 401, 401, 429],
    );
  });

  it("answers 404 for a session that is already gone and keeps the caller signed in", async () => {
    const { cookie } = await login(accounts.owner.email);
    const gone = await request(`/auth/sessions/${"0".repeat(64)}`, { method: "DELETE", cookie });
    assert.equal(gone.status, 404);
    assert.equal(errorCode(gone.json), "NOT_FOUND");
    assert.equal((await request("/auth/me", { cookie })).status, 200);
  });

  it("prunes expired sessions when a new one starts", async () => {
    const expiredId = sha256(randomToken(32));
    await getDb()
      .insert(sessions)
      .values({
        id: expiredId,
        userId: accounts.owner.id,
        createdAt: new Date(Date.now() - 2 * 86_400_000),
        lastSeenAt: new Date(Date.now() - 2 * 86_400_000),
        expiresAt: new Date(Date.now() - 86_400_000),
        ip: "10.9.9.9",
        userAgent: "expired test agent",
      });
    await login(accounts.owner.email);
    const left = await getDb().select().from(sessions).where(eq(sessions.id, expiredId));
    assert.deepEqual(left, []);
  });

  it("accepts an email with padding and capitals", async () => {
    const { response } = await login(`  ${accounts.owner.email.toUpperCase()}\t`);
    assert.equal(response.status, 200);
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

  it("keeps ticket rows out of the dashboard stats without tickets:read", async () => {
    const editor = await addUser("editor", { role: "editor" });
    const { cookie } = await login(editor.email);
    assert.equal((await request("/admin/tickets", { cookie })).status, 403);
    const libraryCount = async () =>
      (await getDb().select({ total: count() }).from(media).where(eq(media.scope, "library")))[0]
        ?.total ?? 0;
    const before = await libraryCount();
    const stats = await request("/admin/stats", { cookie });
    const after = await libraryCount();
    assert.equal(stats.status, 200);
    assert.deepEqual(field(stats.json, "recentTickets"), []);
    const counted = Number(field(field(stats.json, "media"), "count"));
    assert.ok(counted >= Math.min(before, after) && counted <= Math.max(before, after));
    const support = await login(accounts.support.email);
    const supportStats = await request("/admin/stats", { cookie: support.cookie });
    assert.ok(Array.isArray(field(supportStats.json, "recentTickets")));
  });

  it("rejects anonymous admin calls", async () => {
    const response = await request("/admin/stats");
    assert.equal(response.status, 401);
    assert.equal(errorCode(response.json), "UNAUTHORIZED");
  });

  it("rejects anonymous uploads before reading the body", async () => {
    const response = await postJson("/admin/media", { file: "not a file" });
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
    const audit = await request("/admin/audit?entity=users", { cookie });
    assert.ok(
      (field(audit.json, "items") as unknown[]).some(
        (item) => field(item, "entityId") === userId && field(item, "action") === "create",
      ),
      "the new account is linked from the audit log",
    );
    const temporary = String(field(createdUser.json, "temporaryPassword"));
    const first = await login(email, temporary);
    const blocked = await request("/admin/stats", { cookie: first.cookie });
    assert.equal(errorCode(blocked.json), "PASSWORD_CHANGE_REQUIRED");
    const changed = await postJson(
      "/auth/password",
      { currentPassword: temporary, newPassword: randomPassword() },
      { cookie: first.cookie },
    );
    assert.equal(changed.status, 200);
    assert.equal(
      (await request("/admin/stats", { cookie: cookieFrom(changed.headers) })).status,
      200,
    );
    const empty = await postJson(`/admin/users/${userId}`, {}, { cookie, method: "PATCH" });
    assert.equal(empty.status, 422);
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

describe("user administration", () => {
  it("turns off two-factor when an owner resets a password", async () => {
    const target = await addUser("lost-phone", {
      role: "support",
      totpEnabled: true,
      totpSecret: sealSecret("JBSWY3DPEHPK3PXP"),
    });
    const { cookie } = await login(accounts.owner.email);
    const reset = await postJson(`/admin/users/${target.id}/reset-password`, {}, { cookie });
    assert.equal(reset.status, 200);
    const [row] = await getDb()
      .select({ totpEnabled: users.totpEnabled, totpSecret: users.totpSecret })
      .from(users)
      .where(eq(users.id, target.id));
    assert.deepEqual(row, { totpEnabled: false, totpSecret: null });
    const signedIn = await login(target.email, String(field(reset.json, "temporaryPassword")));
    assert.equal(field(signedIn.response.json, "status"), "ok");
  });

  it("returns open tickets to the queue when an agent loses ticket access", async () => {
    const agent = await addUser("agent", { role: "support" });
    const open = await insertTicket({ assigneeId: agent.id });
    const closed = await insertTicket({ assigneeId: agent.id, status: "closed" });
    const { cookie } = await login(accounts.owner.email);
    const moved = await postJson(
      `/admin/users/${agent.id}`,
      { role: "editor" },
      { cookie, method: "PATCH" },
    );
    assert.equal(moved.status, 200, JSON.stringify(moved.json));
    const rows = await getDb()
      .select({ id: tickets.id, assigneeId: tickets.assigneeId })
      .from(tickets)
      .where(inArray(tickets.id, [open, closed]));
    assert.equal(rows.find((row) => row.id === open)?.assigneeId, null);
    assert.equal(rows.find((row) => row.id === closed)?.assigneeId, agent.id);
  });

  it("returns a reopened ticket to the queue when its agent can no longer work it", async () => {
    const agent = await addUser("reopen", { role: "support" });
    const token = randomToken(32);
    const trackingCode = createTrackingCode();
    const phone = `0937${String(Date.now()).slice(-7)}`;
    const resolved = await insertTicket({
      assigneeId: agent.id,
      status: "resolved",
      resolvedAt: new Date(),
      trackingCode,
      accessTokenHash: sha256(token),
      phone,
    });
    const closed = await insertTicket({
      assigneeId: agent.id,
      status: "closed",
      closedAt: new Date(),
      phone,
    });
    const kept = await insertTicket({
      assigneeId: accounts.support.id,
      status: "closed",
      closedAt: new Date(),
      phone,
    });
    try {
      const { cookie } = await login(accounts.owner.email);
      const deactivated = await postJson(
        `/admin/users/${agent.id}`,
        { active: false },
        { cookie, method: "PATCH" },
      );
      assert.equal(deactivated.status, 200, JSON.stringify(deactivated.json));
      const form = new FormData();
      form.set("token", token);
      form.set("body", "It stopped working again.");
      const reply = await request(`/tickets/${trackingCode}/messages`, {
        method: "POST",
        body: form,
        ip: testIp(),
      });
      assert.equal(reply.status, 200, JSON.stringify(reply.json));
      for (const id of [closed, kept]) {
        const reopened = await postJson(
          `/admin/tickets/${id}`,
          { status: "in-review" },
          { cookie, method: "PATCH" },
        );
        assert.equal(reopened.status, 200, JSON.stringify(reopened.json));
      }
      const rows = await getDb()
        .select({ id: tickets.id, status: tickets.status, assigneeId: tickets.assigneeId })
        .from(tickets)
        .where(inArray(tickets.id, [resolved, closed, kept]));
      assert.deepEqual(
        [resolved, closed, kept].map((id) => rows.find((row) => row.id === id)),
        [
          { id: resolved, status: "in-review", assigneeId: null },
          { id: closed, status: "in-review", assigneeId: null },
          { id: kept, status: "in-review", assigneeId: accounts.support.id },
        ],
      );
    } finally {
      await getDb().delete(notificationOutbox).where(eq(notificationOutbox.recipient, phone));
    }
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
    const creations = await request(`/admin/audit?entity=products&action=create`, { cookie });
    const createdEntries = field(creations.json, "items");
    assert.ok(Array.isArray(createdEntries));
    assert.ok(createdEntries.some((entry) => field(entry, "entityId") === created.productId));
    assert.ok(createdEntries.every((entry) => field(entry, "action") === "create"));
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
    const sheet = new FormData();
    sheet.set(
      "file",
      new File([new TextEncoder().encode(`%PDF-1.4\n% ${suffix}\n%%EOF\n`)], "sheet.pdf", {
        type: "application/pdf",
      }),
    );
    const document = await request("/admin/media", { method: "POST", body: sheet, cookie });
    assert.equal(document.status, 200, JSON.stringify(document.json));
    const documentId = String(field(document.json, "id"));
    created.libraryMediaIds.push(documentId);
    const galleryError = async (mediaIds: string[]) => {
      const response = await postJson(
        `/admin/products/${created.productId}/images`,
        { images: mediaIds.map((mediaId) => ({ mediaId, alt: { fa: "", en: "" } })) },
        { cookie, method: "PUT" },
      );
      assert.equal(response.status, 422);
      return field(field(field(response.json, "error"), "fields"), "images");
    };
    assert.equal(await galleryError([documentId]), "Must be an image");
    assert.equal(await galleryError([crypto.randomUUID()]), "Referenced item not found");
    assert.equal(
      await galleryError([created.mediaId, created.mediaId]),
      "Each image must be a distinct uploaded image",
    );
    const refused = await request(`/admin/media/${created.mediaId}`, { method: "DELETE", cookie });
    assert.equal(refused.status, 409);
    assert.equal(errorCode(refused.json), "IN_USE");
  });

  it("counts Markdown images in descriptions and product FAQ answers as usages", async () => {
    const { cookie } = await login(accounts.owner.email);
    const png = await sharp({
      create: {
        width: 52,
        height: 36,
        channels: 3,
        background: {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256),
        },
      },
    })
      .png()
      .toBuffer();
    const form = new FormData();
    form.set("file", new File([new Uint8Array(png)], "inline.png", { type: "image/png" }));
    const upload = await request("/admin/media", { method: "POST", body: form, cookie });
    assert.equal(upload.status, 200, JSON.stringify(upload.json));
    const inlineId = String(field(upload.json, "id"));
    created.libraryMediaIds.push(inlineId);
    const url = String(field(upload.json, "url"));
    const described = await postJson(
      `/admin/products/${created.productId}`,
      { description: { fa: `توضیح\n\n![نما](${url})`, en: `Description\n\n![View](${url})` } },
      { cookie, method: "PATCH" },
    );
    assert.equal(described.status, 200, JSON.stringify(described.json));
    const category = await postJson(
      `/admin/categories/${created.categoryId}`,
      { description: { fa: `![نما](${url})`, en: "" } },
      { cookie, method: "PATCH" },
    );
    assert.equal(category.status, 200, JSON.stringify(category.json));
    const usages = await request(`/admin/media/${inlineId}/usages`, { cookie });
    const found = (usages.json as unknown[]).map((usage) => [
      field(usage, "entity"),
      field(usage, "id"),
    ]);
    assert.deepEqual(
      found.toSorted(),
      [
        ["category", created.categoryId],
        ["product", created.productId],
      ],
      JSON.stringify(usages.json),
    );
    const refused = await request(`/admin/media/${inlineId}`, { method: "DELETE", cookie });
    assert.equal(errorCode(refused.json), "IN_USE");
    const answered = await postJson(
      `/admin/products/${created.productId}`,
      {
        description: { fa: "توضیح", en: "Description" },
        faqs: [
          {
            question: { fa: "پرسش", en: "Question" },
            answer: { fa: `![نما](${url})`, en: "Answer" },
          },
        ],
      },
      { cookie, method: "PATCH" },
    );
    assert.equal(answered.status, 200, JSON.stringify(answered.json));
    const cleared = await postJson(
      `/admin/categories/${created.categoryId}`,
      { description: { fa: "", en: "" } },
      { cookie, method: "PATCH" },
    );
    assert.equal(cleared.status, 200, JSON.stringify(cleared.json));
    const faqUsages = await request(`/admin/media/${inlineId}/usages`, { cookie });
    assert.deepEqual(
      (faqUsages.json as unknown[]).map((usage) => [field(usage, "entity"), field(usage, "id")]),
      [["product", created.productId]],
      JSON.stringify(faqUsages.json),
    );
    const kept = await request(`/admin/media/${inlineId}`, { method: "DELETE", cookie });
    assert.equal(errorCode(kept.json), "IN_USE");
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
    const blocked = await request(`/admin/products/${created.productId}`, {
      method: "DELETE",
      cookie,
    });
    assert.equal(blocked.status, 409);
    assert.equal(errorCode(blocked.json), "HAS_WARRANTY_CODES");
    assert.equal((await request(`/admin/products/${created.productId}`, { cookie })).status, 200);
    await getDb().delete(warrantyCodes).where(eq(warrantyCodes.productId, created.productId));
  });

  it("locks issued policy terms and refuses a policy of another length", async () => {
    const { cookie } = await login(accounts.owner.email);
    const text = { fa: "آزمون", en: "Test" };
    const policy = await postJson(
      "/admin/warranty-policies",
      {
        name: { fa: `قفل آزمون ${suffix}`, en: `Test lock ${suffix}` },
        months: 7,
        partsMonths: null,
        startRule: text,
        coverage: [text],
        exclusions: [],
        effectiveFrom: "2024-01-01",
      },
      { cookie },
    );
    assert.equal(policy.status, 200, JSON.stringify(policy.json));
    const policyId = String(field(policy.json, "id"));
    try {
      const code = await postJson(
        "/admin/warranty-codes/generate",
        { productId: created.productId, productionYear: 1404, policyId },
        { cookie },
      );
      assert.equal(code.status, 200, JSON.stringify(code.json));
      const shortened = await postJson(
        `/admin/warranty-policies/${policyId}`,
        { months: 6, coverage: [{ en: "Test", fa: "آزمون" }] },
        { cookie, method: "PATCH" },
      );
      assert.equal(shortened.status, 422);
      assert.deepEqual(Object.keys(Object(field(field(shortened.json, "error"), "fields"))), [
        "months",
      ]);
      const renamed = await postJson(
        `/admin/warranty-policies/${policyId}`,
        {
          name: { fa: `تغییر نام ${suffix}`, en: `Test renamed ${suffix}` },
          months: 7,
          coverage: [{ en: "Test", fa: "آزمون" }],
        },
        { cookie, method: "PATCH" },
      );
      assert.equal(renamed.status, 200, JSON.stringify(renamed.json));
      await getDb()
        .update(products)
        .set({ warrantyMonths: 11 })
        .where(eq(products.id, created.productId));
      const unmatched = await postJson(
        "/admin/warranty-codes/generate",
        { productId: created.productId, productionYear: 1403 },
        { cookie },
      );
      assert.equal(unmatched.status, 422);
      assert.ok(field(field(field(unmatched.json, "error"), "fields"), "policyId"));
    } finally {
      await getDb()
        .update(products)
        .set({ warrantyMonths: 18 })
        .where(eq(products.id, created.productId));
      await getDb().delete(warrantyCodes).where(eq(warrantyCodes.policyId, policyId));
      await getDb().delete(warrantyPolicies).where(eq(warrantyPolicies.id, policyId));
    }
  });

  it("waits for a code being issued before it decides whether policy terms are locked", async () => {
    const { cookie } = await login(accounts.owner.email);
    const text = { fa: "آزمون", en: "Test" };
    const policy = await postJson(
      "/admin/warranty-policies",
      {
        name: { fa: `هم‌زمان ${suffix}`, en: `Test race ${suffix}` },
        months: 9,
        partsMonths: null,
        startRule: text,
        coverage: [text],
        exclusions: [],
        effectiveFrom: "2024-01-01",
      },
      { cookie },
    );
    assert.equal(policy.status, 200, JSON.stringify(policy.json));
    const policyId = String(field(policy.json, "id"));
    try {
      const state = { settled: false };
      const edit = await getDb().transaction(async (tx) => {
        await tx.insert(warrantyCodes).values({
          code: createWarrantyCode(1402),
          kind: "batch",
          productId: created.productId,
          productionYear: 1402,
          policyId,
        });
        const pending = postJson(
          `/admin/warranty-policies/${policyId}`,
          { months: 12 },
          { cookie, method: "PATCH" },
        ).finally(() => {
          state.settled = true;
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
        assert.equal(state.settled, false, "the policy edit waits for the code insert");
        return { pending };
      });
      const lengthened = await edit.pending;
      assert.equal(lengthened.status, 422, JSON.stringify(lengthened.json));
      assert.deepEqual(Object.keys(Object(field(field(lengthened.json, "error"), "fields"))), [
        "months",
      ]);
      const [row] = await getDb()
        .select({ months: warrantyPolicies.months })
        .from(warrantyPolicies)
        .where(eq(warrantyPolicies.id, policyId));
      assert.equal(row?.months, 9);
    } finally {
      await getDb().delete(warrantyCodes).where(eq(warrantyCodes.policyId, policyId));
      await getDb().delete(warrantyPolicies).where(eq(warrantyPolicies.id, policyId));
    }
  });

  it("rejects contact settings with a malformed email or phone", async () => {
    const { cookie } = await login(accounts.owner.email);
    const current = await request("/admin/settings", { cookie });
    const contact = field(current.json, "contact");
    const label = { fa: "آزمایش", en: "Test" };
    const saved = await postJson(
      "/admin/settings/contact",
      {
        ...(contact as object),
        phones: [{ label, value: "call us maybe" }],
        emails: [{ label, value: "not-an-email" }],
      },
      { cookie, method: "PUT" },
    );
    assert.equal(saved.status, 422);
    const fields = field(field(saved.json, "error"), "fields");
    assert.ok(field(fields, "phones.0.value"));
    assert.ok(field(fields, "emails.0.value"));
  });

  it("refuses a settings save based on an older version", async () => {
    const { cookie } = await login(accounts.owner.email);
    const put = (body: unknown) =>
      postJson("/admin/settings/stats", body, { cookie, method: "PUT" });
    const loaded = await request("/admin/settings/stats", { cookie });
    assert.equal(loaded.status, 200, JSON.stringify(loaded.json));
    const stats = field(loaded.json, "value") as object;
    const first = await put(stats);
    assert.equal(first.status, 200, JSON.stringify(first.json));
    assert.deepEqual(field(first.json, "value"), stats);
    const version = String(field(first.json, "updatedAt"));
    const second = await put({ ...stats, expectedUpdatedAt: version });
    assert.equal(second.status, 200, JSON.stringify(second.json));
    const next = String(field(second.json, "updatedAt"));
    assert.notEqual(next, version);
    assert.equal(
      field((await request("/admin/settings/stats", { cookie })).json, "updatedAt"),
      next,
    );
    const stale = await put({ ...stats, expectedUpdatedAt: version });
    assert.equal(stale.status, 409);
    assert.equal(errorCode(stale.json), "STALE");
    const fresh = await put({ ...stats, expectedUpdatedAt: next });
    assert.equal(fresh.status, 200, JSON.stringify(fresh.json));
  });

  it("switches the journal off and back on", async () => {
    const { cookie } = await login(accounts.owner.email);
    const put = (body: unknown) =>
      postJson("/admin/settings/features", body, { cookie, method: "PUT" });
    try {
      const off = await put({ blog: false });
      assert.equal(off.status, 200, JSON.stringify(off.json));
      assert.deepEqual(field(off.json, "value"), { blog: false });
      const all = await request("/admin/settings", { cookie });
      assert.deepEqual(field(all.json, "features"), { blog: false });
      const invalid = await put({ blog: "no" });
      assert.equal(invalid.status, 422);
    } finally {
      const on = await put({ blog: true });
      assert.equal(on.status, 200, JSON.stringify(on.json));
    }
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
    assert.equal(fallback.status, 200);
    const stamps = (field(fallback.json, "items") as unknown[]).map((item) =>
      new Date(String(field(item, "updatedAt"))).getTime(),
    );
    assert.ok(stamps.every(Number.isFinite));
    assert.deepEqual(
      stamps,
      stamps.toSorted((left, right) => right - left),
    );
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
  const customerPhone = `0935${String(Date.now()).slice(-7)}`;
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
        phone: customerPhone,
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
    const stored = await getDb()
      .select({ scope: media.scope, storageKey: media.storageKey })
      .from(media)
      .where(inArray(media.id, created.attachmentIds));
    assert.ok(
      stored.every((row) => row.scope === "ticket" && row.storageKey.startsWith("private/")),
    );
    const staffUrl = String(field(files[0], "url")).replace(/^\/api/, "");
    const opened = await request(staffUrl, { cookie });
    assert.equal(opened.status, 200);
    assert.equal(opened.headers.get("content-type"), "image/webp");
    assert.match(opened.headers.get("content-disposition") ?? "", /filename="valve\.webp"/);
    assert.equal(opened.headers.get("cache-control"), "private, no-store");
    assert.equal((await request(staffUrl)).status, 401);
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
    const hrefs = publicFiles.map((file) => String(field(file, "href")).replace(/^\/api/, ""));
    assert.ok(hrefs.every((href) => href.startsWith("/tickets/attachments/")));
    const document = await request(hrefs[1] ?? "");
    assert.equal(document.status, 200);
    assert.match(document.headers.get("content-disposition") ?? "", /^attachment;.*wiring\.pdf/);
    const forged = (hrefs[1] ?? "").replace(/signature=[^&]+/, "signature=forged");
    assert.equal((await request(forged)).status, 404);
    const noteLink = customerAttachmentHref(String(field(noteFiles[0], "id")));
    assert.equal((await request(noteLink.replace(/^\/api/, ""))).status, 404);
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

  it("keeps ticket attachments out of the media library", async () => {
    const { cookie } = await login(accounts.owner.email);
    const shared = await photo("shared.png");
    const sent = await reply("Photo for the library check.", false, [shared], cookie);
    assert.equal(sent.status, 200, JSON.stringify(sent.json));
    const attachmentId = String(field(attachmentsOf(lastMessage(sent.json))[0], "id"));
    created.attachmentIds.push(attachmentId);
    const listed = await request("/admin/media?q=shared", { cookie });
    const items = field(listed.json, "items");
    assert.ok(Array.isArray(items));
    assert.ok(items.every((item) => !created.attachmentIds.includes(String(field(item, "id")))));
    assert.equal((await request(`/admin/media/${attachmentId}`, { cookie })).status, 404);
    assert.equal((await request(`/admin/media/${attachmentId}/usages`, { cookie })).status, 404);
    const altered = await postJson(
      `/admin/media/${attachmentId}`,
      { alt: { fa: "تغییر", en: "changed" } },
      { cookie, method: "PATCH" },
    );
    assert.equal(altered.status, 404);
    const [kept] = await getDb()
      .select({ alt: media.alt })
      .from(media)
      .where(eq(media.id, attachmentId));
    assert.deepEqual(kept?.alt, { fa: "", en: "" });
    const logo = await postJson(
      `/admin/brands/${created.brandId}`,
      { logoMediaId: attachmentId },
      { cookie, method: "PATCH" },
    );
    assert.equal(logo.status, 422);
    assert.ok(field(field(field(logo.json, "error"), "fields"), "logoMediaId"));
    const form = new FormData();
    form.set("file", shared);
    const upload = await request("/admin/media", { method: "POST", body: form, cookie });
    assert.equal(upload.status, 200, JSON.stringify(upload.json));
    const libraryId = String(field(upload.json, "id"));
    created.attachmentIds.push(libraryId);
    assert.notEqual(libraryId, attachmentId, "library uploads never reuse a ticket file");
    const [legacy] = await getDb()
      .insert(ticketMessages)
      .values({
        ticketId: created.ticketId,
        authorType: "staff",
        authorId: accounts.owner.id,
        body: "A message from before ticket files had their own scope.",
        internal: true,
        attachmentMediaIds: [libraryId],
      })
      .returning({ id: ticketMessages.id });
    assert.ok(legacy);
    try {
      const usages = await request(`/admin/media/${libraryId}/usages`, { cookie });
      assert.deepEqual(
        (usages.json as unknown[]).map((usage) => [field(usage, "entity"), field(usage, "id")]),
        [["ticket", created.ticketId]],
        JSON.stringify(usages.json),
      );
      const kept = await request(`/admin/media/${libraryId}`, { method: "DELETE", cookie });
      assert.equal(errorCode(kept.json), "IN_USE");
    } finally {
      await getDb().delete(ticketMessages).where(eq(ticketMessages.id, legacy.id));
    }
  });

  it("finds tickets and messages by a mobile number in any common format", async () => {
    const { cookie } = await login(accounts.support.email);
    const national = customerPhone.slice(1);
    const [message] = await getDb()
      .insert(contactMessages)
      .values({
        department: "support",
        name: "Test Customer",
        phone: customerPhone,
        subject: `Mobile search ${suffix}`,
        body: "Please call me back about the heater.",
        ipHash: sha256(randomToken(16)),
      })
      .returning({ id: contactMessages.id });
    assert.ok(message);
    try {
      for (const q of [
        customerPhone,
        national,
        `+98${national}`,
        `98${national}`,
        `0098${national}`,
        `+98 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`,
      ]) {
        const search = `q=${encodeURIComponent(q)}`;
        const found = await request(`/admin/tickets?${search}`, { cookie });
        assert.equal(found.status, 200);
        const ticketIds = (field(found.json, "items") as unknown[]).map((item) =>
          field(item, "id"),
        );
        assert.ok(ticketIds.includes(created.ticketId), q);
        const messages = await request(`/admin/messages?${search}`, { cookie });
        assert.equal(messages.status, 200);
        const messageIds = (field(messages.json, "items") as unknown[]).map((item) =>
          field(item, "id"),
        );
        assert.ok(messageIds.includes(message.id), q);
      }
    } finally {
      await getDb().delete(contactMessages).where(eq(contactMessages.id, message.id));
    }
  });

  it("applies a chosen status with the reply and texts the customer once", async () => {
    const { cookie } = await login(accounts.support.email);
    const sentSince = new Date();
    const response = await postJson(
      `/admin/tickets/${created.ticketId}/messages`,
      {
        body: "Could you send a photo of the rating label?",
        internal: false,
        status: "awaiting-customer",
      },
      { cookie },
    );
    assert.equal(response.status, 200, JSON.stringify(response.json));
    assert.equal(field(response.json, "status"), "awaiting-customer");
    const messages = field(response.json, "messages");
    assert.ok(Array.isArray(messages));
    assert.deepEqual(
      messages.slice(-2).map((message) => [field(message, "authorType"), field(message, "body")]),
      [
        ["staff", "Could you send a photo of the rating label?"],
        ["system", "status:awaiting-customer"],
      ],
    );
    const outbox = await getDb()
      .select({ template: notificationOutbox.template, payload: notificationOutbox.payload })
      .from(notificationOutbox)
      .where(
        and(
          eq(notificationOutbox.recipient, customerPhone),
          gte(notificationOutbox.createdAt, sentSince),
        ),
      );
    assert.deepEqual(outbox, [
      {
        template: "ticket-updated",
        payload: {
          tokens: [
            formatTrackingCode(String(field(response.json, "trackingCode"))),
            "منتظر پاسخ تو",
          ],
        },
      },
    ]);
    await getDb().delete(notificationOutbox).where(eq(notificationOutbox.recipient, customerPhone));
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
    assert.equal(tooMany.status, 413);
    assert.equal(errorCode(tooMany.json), "PAYLOAD_TOO_LARGE");
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

describe("content and catalog consistency", () => {
  const text = (fa: string, en: string) => ({ fa, en });
  const tag = `cc-${suffix}`;
  const cleanup: (() => Promise<unknown>)[] = [];
  const scope = { cookie: "", imageId: "", pdfId: "", categoryId: "", brandId: "", authorId: "" };

  const send = (path: string, body: unknown, method = "POST") =>
    postJson(path, body, { cookie: scope.cookie, method });

  const make = async (path: string, body: unknown, remove: (id: string) => Promise<unknown>) => {
    const response = await send(path, body);
    assert.equal(response.status, 200, JSON.stringify(response.json));
    const id = String(field(response.json, "id"));
    cleanup.push(() => remove(id));
    return id;
  };

  const upload = async (file: File) => {
    const form = new FormData();
    form.set("file", file);
    const response = await request("/admin/media", {
      method: "POST",
      body: form,
      cookie: scope.cookie,
    });
    assert.equal(response.status, 200, JSON.stringify(response.json));
    const id = String(field(response.json, "id"));
    created.libraryMediaIds.push(id);
    return id;
  };

  const removeCategory = (id: string) => getDb().delete(categories).where(eq(categories.id, id));
  const removeBrand = (id: string) => getDb().delete(brands).where(eq(brands.id, id));
  const removeProduct = (id: string) => getDb().delete(products).where(eq(products.id, id));
  const removePost = (id: string) => getDb().delete(posts).where(eq(posts.id, id));

  const categoryBody = (slug: string, published = false) => ({
    slug,
    parentId: null,
    name: text("دسته آزمون", "Test category"),
    summary: text("خلاصه", "Summary"),
    description: text("", ""),
    icon: "fan",
    imageMediaId: null,
    defaultGuideId: null,
    specTemplate: [],
    seo: null,
    sortOrder: 99,
    published,
  });

  const brandBody = (slug: string, published = false) => ({
    slug,
    name: text("برند آزمون", "Test brand"),
    description: text("", ""),
    logoMediaId: null,
    website: null,
    isOwn: false,
    sortOrder: 99,
    published,
  });

  const productBody = (slug: string, overrides: Record<string, unknown> = {}) => ({
    slug,
    modelCode: slug,
    categoryId: scope.categoryId,
    brandId: scope.brandId,
    status: "draft",
    featured: false,
    isNew: false,
    releaseYear: 2026,
    energyClass: "A",
    name: text("مدل آزمون", "Test model"),
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
    ...overrides,
  });

  const postBody = (slug: string, overrides: Record<string, unknown> = {}) => ({
    slug,
    kind: "tips",
    title: text("نوشته آزمون", "Test post"),
    excerpt: text("چکیده", "Excerpt"),
    body: text("متن", "Body"),
    coverMediaId: null,
    authorId: scope.authorId,
    relatedProductIds: [],
    status: "draft",
    seo: null,
    ...overrides,
  });

  const slideBody = (overrides: Record<string, unknown> = {}) => ({
    title: text("اسلاید آزمون", "Test slide"),
    subtitle: text("زیرعنوان", "Subtitle"),
    ctaLabel: null,
    ctaHref: null,
    imageMediaId: scope.imageId,
    mobileImageMediaId: null,
    tone: "light",
    sortOrder: 9000,
    active: false,
    startsAt: null,
    endsAt: null,
    ...overrides,
  });

  const specGroup = (title: string, key: string) => ({
    title: text(title, title),
    items: [
      {
        key,
        label: text("توان", "Power"),
        unit: null,
        unitCode: null,
        value: text("1", "1"),
        numeric: 1,
      },
    ],
  });

  const fieldsOf = (json: unknown) => field(field(json, "error"), "fields");

  const capturePings = () => {
    const pings: string[] = [];
    const original = globalThis.fetch;
    const env = { enabled: process.env.INDEXNOW_ENABLED, key: process.env.INDEXNOW_KEY };
    process.env.INDEXNOW_ENABLED = "true";
    process.env.INDEXNOW_KEY = `test-key-${suffix}`;
    globalThis.fetch = async (_input: RequestInfo | URL, init?: RequestInit) => {
      const urls = field(JSON.parse(String(init?.body)), "urlList");
      if (Array.isArray(urls)) pings.push(...urls.map(String));
      return new Response(null, { status: 200 });
    };
    const restore = () => {
      globalThis.fetch = original;
      process.env.INDEXNOW_ENABLED = env.enabled;
      process.env.INDEXNOW_KEY = env.key;
      if (env.enabled === undefined) delete process.env.INDEXNOW_ENABLED;
      if (env.key === undefined) delete process.env.INDEXNOW_KEY;
    };
    return { pings, restore };
  };

  before(async () => {
    scope.cookie = (await login(accounts.owner.email)).cookie;
    const png = await sharp({
      create: {
        width: 48,
        height: 32,
        channels: 3,
        background: {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256),
        },
      },
    })
      .png()
      .toBuffer();
    scope.imageId = await upload(
      new File([new Uint8Array(png)], "consistency.png", { type: "image/png" }),
    );
    scope.pdfId = await upload(
      new File([`%PDF-1.4\n% ${tag}\n%%EOF\n`], "manual.pdf", { type: "application/pdf" }),
    );
    scope.categoryId = await make("/admin/categories", categoryBody(`${tag}-cat`), removeCategory);
    scope.brandId = await make("/admin/brands", brandBody(`${tag}-brand`), removeBrand);
    scope.authorId = await make(
      "/admin/authors",
      {
        slug: `${tag}-author`,
        name: text("نویسنده آزمون", "Test author"),
        role: text("نقش", "Role"),
        bio: text("", ""),
        avatarMediaId: null,
        sameAs: [],
      },
      (id) => getDb().delete(authors).where(eq(authors.id, id)),
    );
  });

  after(async () => {
    for (const step of cleanup.toReversed()) await step();
  });

  it("dates a post published with a blank date so it goes live", async () => {
    const slug = `${tag}-post`;
    const body = postBody(slug, { status: "published", publishedAt: null });
    const id = await make("/admin/posts", body, removePost);
    const [row] = await getDb().select().from(posts).where(eq(posts.id, id));
    assert.ok(row?.publishedAt && row.publishedAt.getTime() <= Date.now());
    assert.equal((await contentService.post("en", slug))?.slug, slug);
    assert.ok((await contentService.postSlugs()).includes(slug));
    await getDb().update(posts).set({ publishedAt: null }).where(eq(posts.id, id));
    const resaved = await send(`/admin/posts/${id}`, body, "PATCH");
    assert.equal(resaved.status, 200, JSON.stringify(resaved.json));
    assert.ok(field(resaved.json, "publishedAt"));
    const drafted = await send(
      `/admin/posts/${id}`,
      { ...body, status: "draft", publishedAt: null },
      "PATCH",
    );
    assert.equal(field(drafted.json, "publishedAt"), null);
  });

  it("keeps the stored publish time when a save sends the same minute", async () => {
    const publishedAt = "2026-01-02T03:04:05.678Z";
    const id = await make(
      "/admin/posts",
      postBody(`${tag}-minute`, { status: "published", publishedAt }),
      removePost,
    );
    const stored = async () => {
      const [row] = await getDb()
        .select({ publishedAt: posts.publishedAt })
        .from(posts)
        .where(eq(posts.id, id));
      return row?.publishedAt?.toISOString();
    };
    assert.equal(await stored(), publishedAt);
    const same = await send(
      `/admin/posts/${id}`,
      { publishedAt: "2026-01-02T03:04:00.000Z" },
      "PATCH",
    );
    assert.equal(same.status, 200, JSON.stringify(same.json));
    assert.equal(await stored(), publishedAt);
    const moved = await send(
      `/admin/posts/${id}`,
      { publishedAt: "2026-01-02T03:05:00.000Z" },
      "PATCH",
    );
    assert.equal(moved.status, 200, JSON.stringify(moved.json));
    assert.equal(await stored(), "2026-01-02T03:05:00.000Z");
  });

  it("answers an empty PATCH with the stored record", async () => {
    const faqId = await make(
      "/admin/faqs",
      {
        group: "general",
        question: text("پرسش آزمون؟", "Test question?"),
        answer: text("پاسخ", "Answer"),
        sortOrder: 9000,
        published: false,
      },
      (id) => getDb().delete(faqs).where(eq(faqs.id, id)),
    );
    const slideId = await make("/admin/slides", slideBody(), (id) =>
      getDb().delete(heroSlides).where(eq(heroSlides.id, id)),
    );
    const centerId = await make(
      "/admin/service-centers",
      {
        slug: `${tag}-center`,
        kind: "service",
        name: text("مرکز آزمون", "Test center"),
        province: "23",
        city: text("تهران", "Tehran"),
        address: text("نشانی", "Address"),
        phones: ["۰۲۱-۸۸۸۸۸۸۸۸"],
        hours: text("۹ تا ۱۷", "9 to 5"),
        lat: null,
        lng: null,
        categoryIds: [],
        active: false,
      },
      (id) => getDb().delete(serviceCenters).where(eq(serviceCenters.id, id)),
    );
    const [center] = await getDb()
      .select()
      .from(serviceCenters)
      .where(eq(serviceCenters.id, centerId));
    assert.deepEqual(center?.phones, ["021-88888888"]);
    const targets = [
      `/admin/categories/${scope.categoryId}`,
      `/admin/brands/${scope.brandId}`,
      `/admin/authors/${scope.authorId}`,
      `/admin/faqs/${faqId}`,
      `/admin/slides/${slideId}`,
      `/admin/service-centers/${centerId}`,
    ];
    for (const target of targets) {
      const response = await send(target, { unknownField: 1 }, "PATCH");
      assert.equal(response.status, 200, `${target} ${JSON.stringify(response.json)}`);
    }
  });

  it("keeps slide windows ordered, images as images and reorders in one call", async () => {
    const hour = 3_600_000;
    const reversed = await send(
      "/admin/slides",
      slideBody({
        startsAt: new Date(Date.now() + 2 * hour).toISOString(),
        endsAt: new Date(Date.now() + hour).toISOString(),
      }),
    );
    assert.equal(reversed.status, 422);
    assert.ok(field(fieldsOf(reversed.json), "endsAt"));
    const remove = (id: string) => getDb().delete(heroSlides).where(eq(heroSlides.id, id));
    const first = await make(
      "/admin/slides",
      slideBody({
        startsAt: new Date(Date.now() - hour).toISOString(),
        endsAt: new Date(Date.now() + hour).toISOString(),
      }),
      remove,
    );
    const second = await make("/admin/slides", slideBody(), remove);
    const early = await send(
      `/admin/slides/${first}`,
      { endsAt: new Date(Date.now() - 2 * hour).toISOString() },
      "PATCH",
    );
    assert.equal(early.status, 422);
    assert.ok(field(fieldsOf(early.json), "endsAt"));
    const pdf = await send(`/admin/slides/${first}`, { imageMediaId: scope.pdfId }, "PATCH");
    assert.equal(pdf.status, 422);
    assert.equal(field(fieldsOf(pdf.json), "imageMediaId"), "Must be an image");
    const cover = await send(
      `/admin/categories/${scope.categoryId}`,
      { imageMediaId: scope.pdfId },
      "PATCH",
    );
    assert.equal(cover.status, 422);
    const ordered = await postJson(
      "/admin/slides/order",
      { ids: [second, first] },
      { cookie: scope.cookie, method: "PUT" },
    );
    assert.equal(ordered.status, 200, JSON.stringify(ordered.json));
    const rows = await getDb()
      .select({ id: heroSlides.id, sortOrder: heroSlides.sortOrder })
      .from(heroSlides)
      .where(inArray(heroSlides.id, [first, second]));
    assert.equal(rows.find((row) => row.id === second)?.sortOrder, 0);
    assert.equal(rows.find((row) => row.id === first)?.sortOrder, 10);
  });

  it("serialises gallery saves and bumps the product version", async () => {
    const id = await make("/admin/products", productBody(`${tag}-gallery`), removeProduct);
    const [before] = await getDb().select().from(products).where(eq(products.id, id));
    const saves = await Promise.all(
      Array.from({ length: 4 }, () =>
        postJson(
          `/admin/products/${id}/images`,
          { images: [{ mediaId: scope.imageId, alt: text("", ""), isPrimary: true }] },
          { cookie: scope.cookie, method: "PUT" },
        ),
      ),
    );
    assert.deepEqual(
      saves.map((response) => response.status),
      [200, 200, 200, 200],
    );
    const [after] = await getDb().select().from(products).where(eq(products.id, id));
    assert.ok(before && after && after.updatedAt > before.updatedAt);
    const duplicated = await send(
      `/admin/products/${id}`,
      { specs: [specGroup("Electrical", "power"), specGroup("Standby", "power")] },
      "PATCH",
    );
    assert.equal(duplicated.status, 422);
    assert.ok(field(fieldsOf(duplicated.json), "specs.1.items.0.key"));
    const download = await send(
      `/admin/products/${id}`,
      { downloads: [{ kind: "manual", title: text("دفترچه", "Manual"), mediaId: scope.imageId }] },
      "PATCH",
    );
    assert.equal(field(fieldsOf(download.json), "downloads.0.mediaId"), "Must be a document");
  });

  it("saves a product with its gallery in one write and refuses stale editors", async () => {
    const png = await sharp({
      create: {
        width: 40,
        height: 30,
        channels: 3,
        background: {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256),
        },
      },
    })
      .png()
      .toBuffer();
    const secondId = await upload(
      new File([new Uint8Array(png)], "second.png", { type: "image/png" }),
    );
    const image = (mediaId: string, isPrimary = false) => ({
      mediaId,
      alt: text("", ""),
      isPrimary,
    });
    const id = await make(
      "/admin/products",
      productBody(`${tag}-atomic`, { images: [image(scope.imageId, true)] }),
      removeProduct,
    );
    const gallery = () =>
      getDb()
        .select({ mediaId: productImages.mediaId, isPrimary: productImages.isPrimary })
        .from(productImages)
        .where(eq(productImages.productId, id))
        .orderBy(asc(productImages.sortOrder));
    assert.deepEqual(await gallery(), [{ mediaId: scope.imageId, isPrimary: true }]);
    const loaded = String(
      field((await request(`/admin/products/${id}`, { cookie: scope.cookie })).json, "updatedAt"),
    );
    const twice = await send(
      `/admin/products/${id}`,
      {
        name: text("نام تازه", "New name"),
        images: [image(secondId), image(secondId)],
        expectedUpdatedAt: loaded,
      },
      "PATCH",
    );
    assert.equal(twice.status, 422);
    assert.ok(field(fieldsOf(twice.json), "images"));
    const [kept] = await getDb().select().from(products).where(eq(products.id, id));
    assert.equal(kept?.name.en, "Test model");
    const toggled = await send(`/admin/products/${id}`, { featured: true }, "PATCH");
    assert.equal(toggled.status, 200);
    const stale = await send(
      `/admin/products/${id}`,
      { featured: false, images: [], expectedUpdatedAt: loaded },
      "PATCH",
    );
    assert.equal(stale.status, 409);
    assert.equal(errorCode(stale.json), "STALE");
    const [still] = await getDb().select().from(products).where(eq(products.id, id));
    assert.equal(still?.featured, true);
    assert.equal((await gallery()).length, 1);
    const saved = await send(
      `/admin/products/${id}`,
      {
        images: [image(secondId, true), image(scope.imageId)],
        expectedUpdatedAt: String(field(toggled.json, "updatedAt")),
      },
      "PATCH",
    );
    assert.equal(saved.status, 200, JSON.stringify(saved.json));
    assert.deepEqual(await gallery(), [
      { mediaId: secondId, isPrimary: true },
      { mediaId: scope.imageId, isPrimary: false },
    ]);
    const postId = await make("/admin/posts", postBody(`${tag}-stale`), removePost);
    const guideId = await make(
      "/admin/guides",
      {
        slug: `${tag}-stale-guide`,
        title: text("راهنمای آزمون", "Test guide"),
        summary: text("خلاصه", "Summary"),
        video: null,
        durationSec: null,
        steps: [],
        tools: [],
        safety: [],
        chapters: [],
        published: false,
      },
      (guide) => getDb().delete(guides).where(eq(guides.id, guide)),
    );
    const edits: [string, Record<string, unknown>][] = [
      [`/admin/categories/${scope.categoryId}`, { sortOrder: 98 }],
      [`/admin/posts/${postId}`, { title: text("عنوان تازه", "New title") }],
      [`/admin/guides/${guideId}`, { summary: text("خلاصه تازه", "New summary") }],
    ];
    for (const [target, body] of edits) {
      const version = String(
        field((await request(target, { cookie: scope.cookie })).json, "updatedAt"),
      );
      const first = await send(target, { ...body, expectedUpdatedAt: version }, "PATCH");
      assert.equal(first.status, 200, `${target} ${JSON.stringify(first.json)}`);
      const second = await send(target, { ...body, expectedUpdatedAt: version }, "PATCH");
      assert.equal(second.status, 409, target);
      assert.equal(errorCode(second.json), "STALE", target);
    }
  });

  it("refuses stale sheet saves, including one that would undo a slide reorder", async () => {
    const removeSlide = (id: string) => getDb().delete(heroSlides).where(eq(heroSlides.id, id));
    const faqId = await make(
      "/admin/faqs",
      {
        group: "general",
        question: text("پرسش هم‌زمان؟", "Concurrent question?"),
        answer: text("پاسخ", "Answer"),
        sortOrder: 9000,
        published: false,
      },
      (id) => getDb().delete(faqs).where(eq(faqs.id, id)),
    );
    const slideId = await make("/admin/slides", slideBody(), removeSlide);
    const otherId = await make("/admin/slides", slideBody({ sortOrder: 9010 }), removeSlide);
    const centerId = await make(
      "/admin/service-centers",
      {
        slug: `${tag}-stale-center`,
        kind: "service",
        name: text("مرکز آزمون", "Test center"),
        province: "23",
        city: text("تهران", "Tehran"),
        address: text("نشانی", "Address"),
        phones: [],
        hours: text("۹ تا ۱۷", "9 to 5"),
        lat: null,
        lng: null,
        categoryIds: [],
        active: false,
      },
      (id) => getDb().delete(serviceCenters).where(eq(serviceCenters.id, id)),
    );
    const policyId = await make(
      "/admin/warranty-policies",
      {
        name: text(`سیاست ${tag}`, `Policy ${tag}`),
        months: 9,
        partsMonths: null,
        startRule: text("شروع", "Start"),
        coverage: [],
        exclusions: [],
        effectiveFrom: "2024-01-01",
      },
      (id) => getDb().delete(warrantyPolicies).where(eq(warrantyPolicies.id, id)),
    );
    const edits: [string, Record<string, unknown>][] = [
      [`/admin/brands/${scope.brandId}`, { sortOrder: 98 }],
      [`/admin/authors/${scope.authorId}`, { role: text("نقش تازه", "New role") }],
      [`/admin/faqs/${faqId}`, { sortOrder: 9001 }],
      [`/admin/service-centers/${centerId}`, { hours: text("۸ تا ۱۶", "8 to 4") }],
      [`/admin/slides/${slideId}`, { subtitle: text("زیرعنوان تازه", "New subtitle") }],
      [`/admin/warranty-policies/${policyId}`, { months: 10 }],
    ];
    for (const [target, body] of edits) {
      const version = String(
        field((await request(target, { cookie: scope.cookie })).json, "updatedAt"),
      );
      const first = await send(target, { ...body, expectedUpdatedAt: version }, "PATCH");
      assert.equal(first.status, 200, `${target} ${JSON.stringify(first.json)}`);
      const second = await send(target, { ...body, expectedUpdatedAt: version }, "PATCH");
      assert.equal(second.status, 409, target);
      assert.equal(errorCode(second.json), "STALE", target);
    }
    const opened = await request(`/admin/slides/${slideId}`, { cookie: scope.cookie });
    const ordered = await postJson(
      "/admin/slides/order",
      { ids: [otherId, slideId] },
      { cookie: scope.cookie, method: "PUT" },
    );
    assert.equal(ordered.status, 200, JSON.stringify(ordered.json));
    const undone = await send(
      `/admin/slides/${slideId}`,
      {
        ...slideBody({ title: text("عنوان تازه", "Fixed typo") }),
        sortOrder: field(opened.json, "sortOrder"),
        expectedUpdatedAt: String(field(opened.json, "updatedAt")),
      },
      "PATCH",
    );
    assert.equal(undone.status, 409);
    assert.equal(errorCode(undone.json), "STALE");
    const [slide] = await getDb()
      .select({ sortOrder: heroSlides.sortOrder, title: heroSlides.title })
      .from(heroSlides)
      .where(eq(heroSlides.id, slideId));
    assert.deepEqual(slide, { sortOrder: 10, title: text("اسلاید آزمون", "Test slide") });
  });

  it("checks guide chapters against the video and stores them in order", async () => {
    const chapter = (startSec: number) => ({ title: text("بخش", "Part"), startSec });
    const id = await make(
      "/admin/guides",
      {
        slug: `${tag}-guide`,
        title: text("راهنمای آزمون", "Test guide"),
        summary: text("خلاصه", "Summary"),
        video: null,
        durationSec: 100,
        steps: [],
        tools: [],
        safety: [],
        chapters: [chapter(50), chapter(10)],
        published: false,
      },
      (guideId) => getDb().delete(guides).where(eq(guides.id, guideId)),
    );
    const [row] = await getDb().select().from(guides).where(eq(guides.id, id));
    assert.deepEqual(
      row?.chapters.map((entry) => entry.startSec),
      [10, 50],
    );
    const shorter = await send(`/admin/guides/${id}`, { durationSec: 40 }, "PATCH");
    assert.equal(shorter.status, 422);
    assert.ok(field(fieldsOf(shorter.json), "chapters.1.startSec"));
    const twins = await send(
      `/admin/guides/${id}`,
      { chapters: [chapter(5), chapter(5)] },
      "PATCH",
    );
    assert.equal(twins.status, 422);
    assert.equal(field(fieldsOf(twins.json), "chapters.1.startSec"), "Already in use");
  });

  it("drops deleted products and categories from related lists", async () => {
    const gone = await make("/admin/products", productBody(`${tag}-gone`), removeProduct);
    const keeper = await make(
      "/admin/products",
      productBody(`${tag}-keeper`, { relatedIds: [gone] }),
      removeProduct,
    );
    const postId = await make(
      "/admin/posts",
      postBody(`${tag}-related`, { relatedProductIds: [gone] }),
      removePost,
    );
    const spare = await make("/admin/categories", categoryBody(`${tag}-spare`), removeCategory);
    const centerId = await make(
      "/admin/service-centers",
      {
        slug: `${tag}-related-center`,
        kind: "service",
        name: text("مرکز آزمون", "Test center"),
        province: "23",
        city: text("تهران", "Tehran"),
        address: text("نشانی", "Address"),
        phones: [],
        hours: text("۹ تا ۱۷", "9 to 5"),
        lat: null,
        lng: null,
        categoryIds: [spare],
        active: false,
      },
      (id) => getDb().delete(serviceCenters).where(eq(serviceCenters.id, id)),
    );
    assert.equal(
      (await request(`/admin/products/${gone}`, { method: "DELETE", cookie: scope.cookie })).status,
      200,
    );
    assert.equal(
      (await request(`/admin/categories/${spare}`, { method: "DELETE", cookie: scope.cookie }))
        .status,
      200,
    );
    const [product] = await getDb().select().from(products).where(eq(products.id, keeper));
    const [post] = await getDb().select().from(posts).where(eq(posts.id, postId));
    const [center] = await getDb()
      .select()
      .from(serviceCenters)
      .where(eq(serviceCenters.id, centerId));
    assert.deepEqual(product?.relatedIds, []);
    assert.deepEqual(post?.relatedProductIds, []);
    assert.deepEqual(center?.categoryIds, []);
  });

  it("links each product to the guide whose page lists it", async () => {
    const removeGuide = (id: string) => getDb().delete(guides).where(eq(guides.id, id));
    const guideBody = (slug: string, published: boolean) => ({
      slug,
      title: text("راهنمای آزمون", "Test guide"),
      summary: text("خلاصه", "Summary"),
      video: null,
      durationSec: null,
      steps: [],
      tools: [],
      safety: [],
      chapters: [],
      published,
    });
    const liveGuide = await make(
      "/admin/guides",
      guideBody(`${tag}-live-guide`, true),
      removeGuide,
    );
    const draftGuide = await make(
      "/admin/guides",
      guideBody(`${tag}-draft-guide`, false),
      removeGuide,
    );
    const parent = await make(
      "/admin/categories",
      { ...categoryBody(`${tag}-parent`, true), defaultGuideId: liveGuide },
      removeCategory,
    );
    const child = await make(
      "/admin/categories",
      { ...categoryBody(`${tag}-child`, true), parentId: parent, defaultGuideId: draftGuide },
      removeCategory,
    );
    const brandId = await make("/admin/brands", brandBody(`${tag}-guide-brand`, true), removeBrand);
    const seo = { title: text("عنوان سئو", ""), description: text("توضیح سئو", "") };
    const inherits = `${tag}-inherits`;
    const linked = `${tag}-draft-link`;
    await make(
      "/admin/products",
      productBody(inherits, { categoryId: child, brandId, status: "published", seo }),
      removeProduct,
    );
    await make(
      "/admin/products",
      productBody(linked, {
        categoryId: parent,
        brandId,
        status: "published",
        guideId: draftGuide,
      }),
      removeProduct,
    );
    for (const slug of [inherits, linked]) {
      assert.equal((await catalogService.product("en", slug))?.guideSlug, `${tag}-live-guide`);
    }
    const guide = await contentService.guide("en", `${tag}-live-guide`);
    assert.deepEqual(
      guide?.products.map((product) => product.slug).toSorted(),
      [inherits, linked].toSorted(),
    );
    assert.ok(guide?.categories.some((category) => category.slug === `${tag}-child`));
    const english = await catalogService.product("en", inherits);
    assert.deepEqual(english?.seo, { title: null, description: null });
    assert.equal((await catalogService.product("fa", inherits))?.seo.title, "عنوان سئو");
  });

  it("pings IndexNow only for pages the public can see", async () => {
    const { pings, restore } = capturePings();
    try {
      await make("/admin/products", productBody(`${tag}-secret`), removeProduct);
      await make(
        "/admin/products",
        productBody(`${tag}-hidden`, { status: "published" }),
        removeProduct,
      );
      assert.equal(pings.length, 0, JSON.stringify(pings));
      const categoryId = await make(
        "/admin/categories",
        categoryBody(`${tag}-live-cat`, true),
        removeCategory,
      );
      const brandId = await make(
        "/admin/brands",
        brandBody(`${tag}-live-brand`, true),
        removeBrand,
      );
      pings.length = 0;
      await make(
        "/admin/products",
        productBody(`${tag}-live`, { categoryId, brandId, status: "published" }),
        removeProduct,
      );
      assert.ok(
        pings.some((url) => url.endsWith(`/products/${tag}-live`)),
        JSON.stringify(pings),
      );
      assert.ok(pings.some((url) => url.endsWith(`/categories/${tag}-live-cat`)));
      assert.ok(!pings.some((url) => url.endsWith("/compare")));
      pings.length = 0;
      const renamed = await send(
        `/admin/categories/${categoryId}`,
        { slug: `${tag}-moved-cat` },
        "PATCH",
      );
      assert.equal(renamed.status, 200, JSON.stringify(renamed.json));
      assert.ok(pings.some((url) => url.endsWith(`/categories/${tag}-live-cat`)));
      assert.ok(pings.some((url) => url.endsWith(`/categories/${tag}-moved-cat`)));
      assert.ok(pings.some((url) => url.endsWith(`/products/${tag}-live`)));
    } finally {
      restore();
    }
  });
});
