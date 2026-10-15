import "server-only";

import { revalidateTag } from "next/cache";

import { type CacheTag, cacheTags } from "./cache-tags";
import { pingIndexNowPaths } from "./indexnow";

const expire = (tag: CacheTag) => {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch {
    return;
  }
};

export const revalidateContent = (
  tags: readonly CacheTag[],
  paths: readonly (string | null | undefined)[] = [],
) => {
  for (const tag of new Set(tags)) expire(tag);
  const unique = [...new Set(paths.filter((entry): entry is string => Boolean(entry)))];
  if (unique.length > 0) void pingIndexNowPaths(unique);
};

export const revalidateSite = () => revalidateContent(Object.values(cacheTags));
