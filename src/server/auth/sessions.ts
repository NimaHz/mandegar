import "server-only";

import { and, desc, eq, gt, ne } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { sessions, users } from "@/server/db/schema";
import { randomToken, sha256 } from "@/server/lib/crypto";

import { SESSION_ABSOLUTE_SEC } from "./cookie";

const SLIDING_MS = 7 * 86_400_000;
const ABSOLUTE_MS = SESSION_ABSOLUTE_SEC * 1000;
const TOUCH_INTERVAL_MS = 5 * 60_000;

export interface SessionMeta {
  ip: string | null;
  userAgent: string | null;
}

const slidingExpiry = (createdAt: Date, now: number) =>
  new Date(Math.min(now + SLIDING_MS, createdAt.getTime() + ABSOLUTE_MS));

export const sessionIdOf = (token: string) => sha256(token);

export const createSession = async (userId: string, meta: SessionMeta) => {
  const token = randomToken(32);
  const now = Date.now();
  const createdAt = new Date(now);
  await getDb()
    .insert(sessions)
    .values({
      id: sessionIdOf(token),
      userId,
      createdAt,
      lastSeenAt: createdAt,
      expiresAt: slidingExpiry(createdAt, now),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
  return token;
};

export const validateSession = async (token: string | undefined) => {
  if (!token || token.length < 20 || token.length > 100) return null;
  const id = sessionIdOf(token);
  const [row] = await getDb()
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(eq(sessions.id, id));
  if (!row) return null;
  const now = Date.now();
  const expired =
    row.session.expiresAt.getTime() <= now ||
    row.session.createdAt.getTime() + ABSOLUTE_MS <= now ||
    !row.user.active;
  if (expired) {
    await getDb().delete(sessions).where(eq(sessions.id, id));
    return null;
  }
  if (now - row.session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await getDb()
      .update(sessions)
      .set({ lastSeenAt: new Date(now), expiresAt: slidingExpiry(row.session.createdAt, now) })
      .where(eq(sessions.id, id));
  }
  return row;
};

export const revokeSession = async (id: string, userId?: string) => {
  const removed = await getDb()
    .delete(sessions)
    .where(userId ? and(eq(sessions.id, id), eq(sessions.userId, userId)) : eq(sessions.id, id))
    .returning({ id: sessions.id });
  return removed.length > 0;
};

export const revokeUserSessions = async (userId: string, exceptId?: string) => {
  await getDb()
    .delete(sessions)
    .where(
      exceptId
        ? and(eq(sessions.userId, userId), ne(sessions.id, exceptId))
        : eq(sessions.userId, userId),
    );
};

export const listSessions = (userId: string) =>
  getDb()
    .select()
    .from(sessions)
    .where(and(eq(sessions.userId, userId), gt(sessions.expiresAt, new Date())))
    .orderBy(desc(sessions.lastSeenAt));
