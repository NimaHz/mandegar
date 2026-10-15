import "server-only";

import { isProvinceCode } from "@/lib/provinces";
import { cacheTags } from "@/server/lib/cache-tags";

import { cached, isListed } from "../cache";
import type { ContentService } from "../contracts";
import { contentService } from "../db/content";

const { catalog, guides, posts, faqs, slides, serviceCenters, settings } = cacheTags;
const MAX_CACHED_PAGE = 5;

const guideSlugs = cached("content.guideSlugs", [guides], contentService.guideSlugs);
const postSlugs = cached("content.postSlugs", [posts], contentService.postSlugs);
const authorSlugs = cached("content.authorSlugs", [posts], contentService.authorSlugs);

const guide = cached("content.guide", [guides, catalog], contentService.guide);
const postPage = cached("content.posts", [posts], contentService.posts);
const post = cached("content.post", [posts, catalog], contentService.post);
const author = cached("content.author", [posts], contentService.author);
const authorPosts = cached("content.authorPosts", [posts], contentService.authorPosts);
const centers = cached(
  "content.serviceCenters",
  [serviceCenters, catalog],
  contentService.serviceCenters,
);

export const cachedContent: ContentService = {
  heroSlides: cached("content.heroSlides", [slides], contentService.heroSlides),
  faqs: cached("content.faqs", [faqs], contentService.faqs),
  guides: cached("content.guides", [guides, catalog], contentService.guides),
  guide: async (locale, slug) => ((await isListed(guideSlugs, slug)) ? guide(locale, slug) : null),
  guideSlugs,
  posts: async (locale, query) =>
    query.page <= MAX_CACHED_PAGE ? postPage(locale, query) : contentService.posts(locale, query),
  latestPosts: cached("content.latestPosts", [posts], contentService.latestPosts),
  post: async (locale, slug) => ((await isListed(postSlugs, slug)) ? post(locale, slug) : null),
  postSlugs,
  author: async (locale, slug) =>
    (await isListed(authorSlugs, slug)) ? author(locale, slug) : null,
  authorPosts: async (locale, slug) =>
    (await isListed(authorSlugs, slug)) ? authorPosts(locale, slug) : [],
  authorSlugs,
  serviceCenters: async (locale, query) =>
    !query.province || isProvinceCode(query.province)
      ? centers(locale, query)
      : contentService.serviceCenters(locale, query),
  provinces: cached("content.provinces", [serviceCenters], contentService.provinces),
  settings: cached("content.settings", [settings], contentService.settings),
};
