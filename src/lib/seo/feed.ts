import { type Locale, localeMeta, locales } from "@/i18n/config";
import { routes } from "@/lib/routes";
import type { PostDetail, PostKind } from "@/types/content";

import { escapeXml } from "./sitemap-xml";
import type { SiteSnapshot } from "./snapshot";
import { absoluteUrl, localeUrl } from "./urls";

const FEED_SIZE = 30;
const LOGO_PATH = "/apple-icon.png";
const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';

export interface FeedCopy {
  title: string;
  description: string;
  kind: (kind: PostKind) => string;
}

export const feedName = (locale: Locale) => `blog-${locale}.xml`;

export const feedPath = (locale: Locale) => `/feeds/${feedName(locale)}`;

export const feedLocale = (name: string) =>
  locales.find((locale) => feedName(locale) === name) ?? null;

const tag = (name: string, value: string) => `<${name}>${escapeXml(value)}</${name}>`;

const rfc822 = (value: string) => new Date(value).toUTCString();

const itemXml = (locale: Locale, post: PostDetail, copy: FeedCopy) => {
  const url = localeUrl(locale, routes.post(post.slug));
  return [
    "<item>",
    tag("title", post.title),
    tag("link", url),
    `<guid isPermaLink="true">${escapeXml(url)}</guid>`,
    tag("pubDate", rfc822(post.publishedAt)),
    tag("description", post.excerpt),
    tag("dc:creator", post.author.name),
    tag("category", copy.kind(post.kind)),
    post.cover
      ? `<media:content url="${escapeXml(absoluteUrl(post.cover.src))}" medium="image" width="${post.cover.width}" height="${post.cover.height}"/>`
      : "",
    "</item>",
  ].join("");
};

export const feedXml = (locale: Locale, snapshot: SiteSnapshot, copy: FeedCopy) => {
  const posts = snapshot[locale].posts
    .toSorted((first, second) => second.publishedAt.localeCompare(first.publishedAt))
    .slice(0, FEED_SIZE);
  const blogUrl = localeUrl(locale, routes.blog);
  const updated = posts
    .flatMap((post) => [post.publishedAt, post.updatedAt])
    .toSorted()
    .at(-1);
  return [
    XML_HEADER,
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">',
    "<channel>",
    tag("title", copy.title),
    tag("link", blogUrl),
    tag("description", copy.description),
    tag("language", localeMeta[locale].hreflang),
    updated ? tag("lastBuildDate", rfc822(updated)) : "",
    `<atom:link href="${escapeXml(absoluteUrl(feedPath(locale)))}" rel="self" type="application/rss+xml"/>`,
    "<image>",
    tag("url", absoluteUrl(LOGO_PATH)),
    tag("title", copy.title),
    tag("link", blogUrl),
    "</image>",
    ...posts.map((post) => itemXml(locale, post, copy)),
    "</channel>",
    "</rss>",
  ].join("");
};

export const rssResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
