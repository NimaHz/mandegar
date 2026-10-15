import "server-only";

import { and, eq, lt, lte, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";

import { tooManyRequests } from "./http-error";

export interface RateLimitRule {
  key: string;
  limit: number;
  windowSec: number;
}

interface RateLimitResult {
  allowed: boolean;
  count: number;
  excess: number;
  retryAfterSec: number;
}

export interface Attempt extends RateLimitResult {
  release: () => Promise<void>;
}

export interface Reservation {
  allowed: boolean;
  retryAfterSec: number;
  release: () => Promise<void>;
}

const RETENTION_MS = 2 * 86_400_000;

const bucketOf = (key: string, windowSec: number) => `${key}|${windowSec}`;

const retryAfter = (windowStart: Date, windowSec: number, now: number) =>
  Math.max(1, Math.ceil((windowStart.getTime() + windowSec * 1000 - now) / 1000));

const pruneExpired = async () => {
  if (Math.random() >= 0.01) return;
  await getDb()
    .delete(rateLimits)
    .where(lt(rateLimits.windowStart, new Date(Date.now() - RETENTION_MS)));
};

const increment = async ({ key, limit, windowSec }: RateLimitRule) => {
  const now = Date.now();
  const current = new Date(now);
  const cutoff = new Date(now - windowSec * 1000);
  const fresh = lte(rateLimits.windowStart, cutoff);
  const startedAt = sql`${current.toISOString()}::timestamptz`;
  const [row] = await getDb()
    .insert(rateLimits)
    .values({ key: bucketOf(key, windowSec), windowStart: current, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${fresh} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${fresh} then ${startedAt} else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count, windowStart: rateLimits.windowStart });
  await pruneExpired();
  const count = row?.count ?? 1;
  const windowStart = row?.windowStart ?? current;
  return {
    windowStart,
    result: {
      allowed: count <= limit,
      count,
      excess: Math.max(0, count - limit),
      retryAfterSec: retryAfter(windowStart, windowSec, now),
    },
  };
};

const decrement = async ({ key, windowSec }: RateLimitRule, windowStart: Date) => {
  await getDb()
    .update(rateLimits)
    .set({ count: sql`greatest(${rateLimits.count} - 1, 0)` })
    .where(
      and(eq(rateLimits.key, bucketOf(key, windowSec)), eq(rateLimits.windowStart, windowStart)),
    );
};

const rateLimit = async (rule: RateLimitRule): Promise<RateLimitResult> =>
  (await increment(rule)).result;

export const countAttempt = async (rule: RateLimitRule): Promise<Attempt> => {
  const { windowStart, result } = await increment(rule);
  let released = false;
  return {
    ...result,
    release: async () => {
      if (released) return;
      released = true;
      await decrement(rule, windowStart);
    },
  };
};

export const reserveAttempts = async (rules: readonly RateLimitRule[]): Promise<Reservation> => {
  const attempts = await Promise.all(rules.map(countAttempt));
  const release = async () => {
    await Promise.all(attempts.map((attempt) => attempt.release()));
  };
  const blocked = attempts.filter((attempt) => !attempt.allowed);
  if (blocked.length > 0) await release();
  return {
    allowed: blocked.length === 0,
    retryAfterSec: Math.max(0, ...blocked.map((attempt) => attempt.retryAfterSec)),
    release,
  };
};

export const enforceRateLimit = async (key: string, limit: number, windowSec: number) => {
  const result = await rateLimit({ key, limit, windowSec });
  if (!result.allowed) throw tooManyRequests(result.retryAfterSec);
};

export const claimOnce = async (key: string, windowSec: number) =>
  (await rateLimit({ key, limit: 1, windowSec })).allowed;
