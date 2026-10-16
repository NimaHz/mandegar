import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { burnPasswordCheck, hashPassword, verifyPassword } from "@/server/auth/password";
import { toIdentity } from "@/server/auth/permissions";
import {
  createSession,
  listSessions,
  revokeSession,
  revokeUserSessions,
  sessionIdOf,
  type SessionMeta,
} from "@/server/auth/sessions";
import { createTotpSecret, verifyTotp } from "@/server/auth/totp";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { sha256 } from "@/server/lib/crypto";
import { conflict, notFound, tooManyRequests, unauthorized } from "@/server/lib/http-error";
import {
  claimOnce,
  countAttempt,
  type RateLimitRule,
  reserveAttempts,
} from "@/server/lib/rate-limit";
import { recordAudit } from "@/server/plugins/audit";
import { type AdminActor } from "@/server/plugins/auth";
import type { AdminIdentity, AdminSession } from "@/types/admin";

import type {
  changePasswordSchema,
  loginSchema,
  totpDisableSchema,
  totpEnableSchema,
} from "./schema";

const LOCKOUT_WINDOW_SEC = 900;
const DAY_SEC = 86_400;
const THROTTLE_STEP_MS = 500;
const THROTTLE_MAX_MS = 5_000;

const strictLimits = (emailKey: string, clientKey: string): RateLimitRule[] => [
  { key: `login-pair:${emailKey}:${clientKey}`, limit: 5, windowSec: LOCKOUT_WINDOW_SEC },
  { key: `login-pair-day:${emailKey}:${clientKey}`, limit: 20, windowSec: DAY_SEC },
  { key: `login-ip:${clientKey}`, limit: 30, windowSec: LOCKOUT_WINDOW_SEC },
];

const emailLimits = (emailKey: string): RateLimitRule[] => [
  { key: `login-email:${emailKey}`, limit: 5, windowSec: LOCKOUT_WINDOW_SEC },
  { key: `login-email-day:${emailKey}`, limit: 20, windowSec: DAY_SEC },
];

const secondFactorLimits = (userId: string): RateLimitRule[] => [
  { key: `login-totp:${userId}`, limit: 10, windowSec: LOCKOUT_WINDOW_SEC },
  { key: `login-totp-day:${userId}`, limit: 50, windowSec: DAY_SEC },
];

const reauthLimits = (userId: string): RateLimitRule[] => [
  { key: `reauth:${userId}`, limit: 5, windowSec: LOCKOUT_WINDOW_SEC },
  { key: `reauth-day:${userId}`, limit: 20, windowSec: DAY_SEC },
];

const throttleDelay = (excess: number) =>
  Math.min(THROTTLE_MAX_MS, THROTTLE_STEP_MS * 2 ** (excess - 1));

const pause = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const invalidCredentials = () => unauthorized("Invalid email or password", "INVALID_CREDENTIALS");

const limitedCheck = async (rules: RateLimitRule[], check: () => Promise<boolean>) => {
  const reservation = await reserveAttempts(rules);
  if (!reservation.allowed) throw tooManyRequests(reservation.retryAfterSec);
  const passed = await check();
  if (passed) await reservation.release();
  return passed;
};

type LoginResult = { status: "ok"; user: AdminIdentity } | { status: "totp-required" };

const findUser = async (id: string) => {
  const [user] = await getDb().select().from(users).where(eq(users.id, id));
  if (!user) throw unauthorized();
  return user;
};

const auditAuth = (
  actor: { id: string; ip: string | null; userAgent: string | null },
  action: string,
) =>
  recordAudit({
    actorId: actor.id,
    action,
    entity: "auth",
    entityId: actor.id,
    diff: null,
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

const alertThrottled = (emailKey: string, userId: string, attempts: number, meta: SessionMeta) =>
  claimOnce(`login-alert:${emailKey}`, LOCKOUT_WINDOW_SEC)
    .then((first) =>
      first
        ? recordAudit({
            actorId: null,
            action: "login.throttled",
            entity: "auth",
            entityId: userId,
            diff: { attempts },
            ip: meta.ip,
            userAgent: meta.userAgent,
          })
        : undefined,
    )
    .catch((error: unknown) => console.error(error));

export const login = async (
  input: z.output<typeof loginSchema>,
  meta: SessionMeta & { clientKey: string; previousToken: string | undefined },
): Promise<{ result: LoginResult; token: string | null }> => {
  const emailKey = sha256(input.email);
  const strict = await reserveAttempts(strictLimits(emailKey, meta.clientKey));
  if (!strict.allowed) throw tooManyRequests(strict.retryAfterSec);
  const [attempts, [user]] = await Promise.all([
    Promise.all(emailLimits(emailKey).map(countAttempt)),
    getDb().select().from(users).where(eq(users.email, input.email)),
  ]);
  const release = () =>
    Promise.all([strict.release(), ...attempts.map((attempt) => attempt.release())]);
  const excess = Math.max(...attempts.map((attempt) => attempt.excess));
  if (excess > 0) {
    const count = Math.max(...attempts.map((attempt) => attempt.count));
    if (user) void alertThrottled(emailKey, user.id, count, meta);
    await pause(throttleDelay(excess));
  }
  const passwordOk = user
    ? await verifyPassword(user.passwordHash, input.password)
    : await burnPasswordCheck(input.password);
  if (!user || !user.active || !passwordOk) throw invalidCredentials();
  if (user.totpEnabled) {
    const code = input.totp;
    if (!code) {
      await release();
      return { result: { status: "totp-required" }, token: null };
    }
    const verified = await limitedCheck(secondFactorLimits(user.id), () =>
      verifyTotp(user.id, user.totpSecret, code),
    );
    if (!verified) throw invalidCredentials();
  }
  await release();
  if (meta.previousToken) await revokeSession(sessionIdOf(meta.previousToken));
  const token = await createSession(user.id, meta);
  await getDb().update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await auditAuth({ id: user.id, ip: meta.ip, userAgent: meta.userAgent }, "login");
  return { result: { status: "ok", user: toIdentity(user) }, token };
};

export const logout = async (token: string | undefined) => {
  if (token) await revokeSession(sessionIdOf(token));
  return { ok: true as const };
};

export const changePassword = async (
  actor: AdminActor,
  input: z.output<typeof changePasswordSchema>,
) => {
  const user = await findUser(actor.id);
  const verified = await limitedCheck(reauthLimits(user.id), () =>
    verifyPassword(user.passwordHash, input.currentPassword),
  );
  if (!verified) throw unauthorized("Current password is wrong", "INVALID_CREDENTIALS");
  await getDb()
    .update(users)
    .set({ passwordHash: await hashPassword(input.newPassword), mustChangePassword: false })
    .where(eq(users.id, user.id));
  await revokeUserSessions(user.id);
  const token = await createSession(user.id, actor);
  await auditAuth(actor, "password");
  return token;
};

export const setupTotp = async (actor: AdminActor) => {
  const user = await findUser(actor.id);
  if (user.totpEnabled) throw conflict("Two-factor authentication is already enabled");
  const { secret, sealed, uri } = createTotpSecret(user.email);
  await getDb().update(users).set({ totpSecret: sealed }).where(eq(users.id, user.id));
  return { secret, uri };
};

const confirmFactors = (
  user: typeof users.$inferSelect,
  input: { password: string; code: string },
) =>
  limitedCheck(
    reauthLimits(user.id),
    async () =>
      (await verifyPassword(user.passwordHash, input.password)) &&
      (await verifyTotp(user.id, user.totpSecret, input.code)),
  );

export const enableTotp = async (actor: AdminActor, input: z.output<typeof totpEnableSchema>) => {
  const user = await findUser(actor.id);
  if (user.totpEnabled) throw conflict("Two-factor authentication is already enabled");
  if (!(await confirmFactors(user, input))) throw invalidCredentials();
  await getDb().update(users).set({ totpEnabled: true }).where(eq(users.id, user.id));
  await revokeUserSessions(user.id, actor.sessionId);
  await auditAuth(actor, "totp.enable");
  return { ok: true as const };
};

export const disableTotp = async (actor: AdminActor, input: z.output<typeof totpDisableSchema>) => {
  const user = await findUser(actor.id);
  if (!user.totpEnabled) throw conflict("Two-factor authentication is not enabled");
  if (!(await confirmFactors(user, input))) throw invalidCredentials();
  await getDb()
    .update(users)
    .set({ totpEnabled: false, totpSecret: null })
    .where(eq(users.id, user.id));
  await revokeUserSessions(user.id, actor.sessionId);
  await auditAuth(actor, "totp.disable");
  return { ok: true as const };
};

export const sessionsOf = async (actor: AdminActor): Promise<AdminSession[]> =>
  (await listSessions(actor.id)).map((session) => ({
    id: session.id,
    current: session.id === actor.sessionId,
    ip: session.ip,
    userAgent: session.userAgent,
    createdAt: session.createdAt.toISOString(),
    lastSeenAt: session.lastSeenAt.toISOString(),
    expiresAt: session.expiresAt.toISOString(),
  }));

export const revokeOwnSession = async (actor: AdminActor, id: string) => {
  if (!(await revokeSession(id, actor.id))) throw notFound("Session not found");
  await auditAuth(actor, "session.revoke");
  return { ok: true as const, current: id === actor.sessionId };
};
