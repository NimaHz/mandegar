import "server-only";

import { and, eq, gt, lt, lte, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { rateLimits } from "@/server/db/schema";

import { tooManyRequests } from "./http-error";

interface RateLimitResult {
  allowed: boolean;
  count: number;
  retryAfterSec: number;
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

export const rateLimit = async (
  key: string,
  limit: number,
  windowSec: number,
): Promise<RateLimitResult> => {
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
  return {
    allowed: count <= limit,
    count,
    retryAfterSec: retryAfter(row?.windowStart ?? current, windowSec, now),
  };
};

export const isRateLimited = async (key: string, limit: number, windowSec: number) => {
  const now = Date.now();
  const [row] = await getDb()
    .select({ count: rateLimits.count, windowStart: rateLimits.windowStart })
    .from(rateLimits)
    .where(
      and(
        eq(rateLimits.key, bucketOf(key, windowSec)),
        gt(rateLimits.windowStart, new Date(now - windowSec * 1000)),
      ),
    );
  return row !== undefined && row.count >= limit;
};

export const enforceRateLimit = async (key: string, limit: number, windowSec: number) => {
  const result = await rateLimit(key, limit, windowSec);
  if (!result.allowed) throw tooManyRequests(result.retryAfterSec);
};

export const claimOnce = async (key: string, windowSec: number) =>
  (await rateLimit(key, 1, windowSec)).allowed;
