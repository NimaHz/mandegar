import "server-only";

import { unstable_cache } from "next/cache";
import { cache } from "react";

import type { CacheTag } from "@/server/lib/cache-tags";

import { normalizeSlug } from "./db/mappers";

const REVALIDATE_SEC = 3600;

export const cached = <TArgs extends unknown[], TResult>(
  key: string,
  tags: readonly CacheTag[],
  load: (...args: TArgs) => Promise<TResult>,
) => cache(unstable_cache(load, [key], { tags: [...tags], revalidate: REVALIDATE_SEC }));

export const isListed = async (slugs: () => Promise<string[]>, slug: string) =>
  (await slugs()).includes(normalizeSlug(slug));
