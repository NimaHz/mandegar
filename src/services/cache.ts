import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { Locale } from "@/i18n/config";
import type { CacheTag } from "@/server/lib/cache-tags";

import { normalizeSlug } from "./db/mappers";

const REVALIDATE_SEC = 3600;

export const cached = <TArgs extends unknown[], TResult>(
  key: string,
  tags: readonly CacheTag[],
  load: (...args: TArgs) => Promise<TResult>,
) => cache(unstable_cache(load, [key], { tags: [...tags], revalidate: REVALIDATE_SEC }));

export const perRequest = <TArgs extends unknown[], TResult>(
  load: (...args: TArgs) => Promise<TResult>,
) => {
  const results = cache(() => new Map<string, Promise<TResult>>());
  return (...args: TArgs) => {
    const key = JSON.stringify(args);
    const store = results();
    const hit = store.get(key);
    if (hit) return hit;
    const result = load(...args);
    store.set(key, result);
    return result;
  };
};

const secondsUntil = (time: number, now: number) =>
  Math.min(REVALIDATE_SEC, Math.max(1, Math.ceil((time - now) / 1000)));

export const scheduled = <TArgs extends unknown[], TResult>(
  key: string,
  tags: readonly CacheTag[],
  load: (...args: TArgs) => Promise<TResult>,
  schedule: () => Promise<number[]>,
) =>
  cache(async (...args: TArgs) => {
    const now = Date.now();
    const times = await schedule();
    const since = times.reduce((last, time) => (time <= now && time > last ? time : last), 0);
    const next = times.reduce(
      (soonest, time) => (time > now && time < soonest ? time : soonest),
      Infinity,
    );
    return unstable_cache(load, [key, String(since)], {
      tags: [...tags],
      revalidate: Number.isFinite(next) ? secondsUntil(next, now) : REVALIDATE_SEC,
    })(...args);
  });

export const isListed = async (slugs: () => Promise<string[]>, slug: string) =>
  (await slugs()).includes(normalizeSlug(slug));

export const whenListed =
  <TResult, TRest extends unknown[]>(
    slugs: () => Promise<string[]>,
    load: (locale: Locale, slug: string, ...rest: TRest) => Promise<TResult>,
    fallback: TResult,
  ) =>
  async (locale: Locale, slug: string, ...rest: TRest) => {
    const key = normalizeSlug(slug);
    return (await slugs()).includes(key) ? load(locale, key, ...rest) : fallback;
  };
