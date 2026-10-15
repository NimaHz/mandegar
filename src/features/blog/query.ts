import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { api } from "@/services";
import type { PostDetail, PostListItem } from "@/types/content";

export const getPost = cache((locale: Locale, slug: string) => api.content.post(locale, slug));

export const getAuthor = cache((locale: Locale, slug: string) => api.content.author(locale, slug));

export const findRelatedPosts = async (locale: Locale, post: PostDetail, limit = 3) => {
  const [sameKind, latest] = await Promise.all([
    api.content.posts(locale, { kind: post.kind, page: 1 }),
    api.content.latestPosts(locale, limit + 1),
  ]);
  const unique = new Map<string, PostListItem>();
  for (const item of [...sameKind.items, ...latest]) {
    if (item.slug !== post.slug) unique.set(item.slug, item);
  }
  return [...unique.values()].slice(0, limit);
};
