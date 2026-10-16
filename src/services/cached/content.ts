import "server-only";

import { isProvinceCode } from "@/lib/provinces";
import { cacheTags } from "@/server/lib/cache-tags";
import { clampPage } from "@/server/lib/pagination";

import { cached, perRequest, scheduled, whenListed } from "../cache";
import type { ContentService } from "../contracts";
import { contentSchedules, contentService } from "../db/content";

const { catalog, guides, posts, faqs, slides, serviceCenters, settings } = cacheTags;
const MAX_CACHED_PAGE = 5;

const postSchedule = cached("content.postSchedule", [posts], contentSchedules.posts);
const slideSchedule = cached("content.slideSchedule", [slides], contentSchedules.slides);

const guideSlugs = cached("content.guideSlugs", [guides], contentService.guideSlugs);
const postSlugs = scheduled("content.postSlugs", [posts], contentService.postSlugs, postSchedule);
const authorSlugs = scheduled(
  "content.authorSlugs",
  [posts],
  contentService.authorSlugs,
  postSchedule,
);

const guide = cached("content.guide", [guides, catalog], contentService.guide);
const postPage = scheduled("content.posts", [posts], contentService.posts, postSchedule);
const post = scheduled("content.post", [posts, catalog], contentService.post, postSchedule);
const author = scheduled("content.author", [posts], contentService.author, postSchedule);
const authorPosts = scheduled(
  "content.authorPosts",
  [posts],
  contentService.authorPosts,
  postSchedule,
);

const postListing: ContentService["posts"] = async (locale, query) => {
  const page = clampPage(query.page);
  return page <= MAX_CACHED_PAGE
    ? postPage(locale, { ...query, page })
    : contentService.posts(locale, query);
};

const centers = cached(
  "content.serviceCenters",
  [serviceCenters, catalog],
  contentService.serviceCenters,
);

export const cachedContent: ContentService = {
  heroSlides: scheduled("content.heroSlides", [slides], contentService.heroSlides, slideSchedule),
  faqs: cached("content.faqs", [faqs], contentService.faqs),
  guides: cached("content.guides", [guides, catalog], contentService.guides),
  guide: whenListed(guideSlugs, guide, null),
  guideSlugs,
  posts: perRequest(postListing),
  latestPosts: scheduled("content.latestPosts", [posts], contentService.latestPosts, postSchedule),
  post: whenListed(postSlugs, post, null),
  postSlugs,
  author: whenListed(authorSlugs, author, null),
  authorPosts: whenListed(authorSlugs, authorPosts, []),
  authorSlugs,
  serviceCenters: async (locale, query) =>
    !query.province || isProvinceCode(query.province)
      ? centers(locale, query)
      : contentService.serviceCenters(locale, query),
  provinces: cached("content.provinces", [serviceCenters], contentService.provinces),
  settings: cached("content.settings.v2", [settings], contentService.settings),
};
