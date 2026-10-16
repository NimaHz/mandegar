import { defaultLocale, localeMeta, locales } from "@/i18n/config";

import type { SitemapEntry, SitemapVideo } from "./sitemaps";
import { tehranIso } from "./text";
import { absoluteUrl, localeUrl } from "./urls";

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8"?>';
const SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9";
const VIDEO_TEXT_MAX = 2048;

export const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const tag = (name: string, value: string) => `<${name}>${escapeXml(value)}</${name}>`;

const alternates = (path: string) =>
  [
    ...locales.map((locale) => ({
      hreflang: localeMeta[locale].hreflang,
      href: localeUrl(locale, path),
    })),
    { hreflang: "x-default", href: localeUrl(defaultLocale, path) },
  ]
    .map(
      (link) =>
        `<xhtml:link rel="alternate" hreflang="${link.hreflang}" href="${escapeXml(link.href)}"/>`,
    )
    .join("");

const videoXml = (video: SitemapVideo) =>
  [
    "<video:video>",
    tag("video:thumbnail_loc", absoluteUrl(video.thumbnail)),
    tag("video:title", video.title),
    tag("video:description", video.description.slice(0, VIDEO_TEXT_MAX)),
    video.contentUrl ? tag("video:content_loc", absoluteUrl(video.contentUrl)) : "",
    video.playerUrl ? tag("video:player_loc", video.playerUrl) : "",
    video.durationSec ? tag("video:duration", String(Math.round(video.durationSec))) : "",
    video.publishedAt ? tag("video:publication_date", tehranIso(video.publishedAt)) : "",
    tag("video:family_friendly", "yes"),
    "</video:video>",
  ].join("");

export const urlsetXml = (entries: SitemapEntry[]) => {
  const urls = entries.flatMap((entry) =>
    locales.map((locale) => {
      const video = entry.videos[locale];
      return [
        "<url>",
        tag("loc", localeUrl(locale, entry.path)),
        entry.lastModified ? tag("lastmod", tehranIso(entry.lastModified)) : "",
        alternates(entry.path),
        ...entry.images.map(
          (image) => `<image:image>${tag("image:loc", absoluteUrl(image))}</image:image>`,
        ),
        video ? videoXml(video) : "",
        "</url>",
      ].join("");
    }),
  );
  return [
    XML_HEADER,
    `<urlset xmlns="${SITEMAP_NS}" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`,
    ...urls,
    "</urlset>",
  ].join("\n");
};

export const sitemapIndexXml = (items: { path: string; lastModified: string | null }[]) =>
  [
    XML_HEADER,
    `<sitemapindex xmlns="${SITEMAP_NS}">`,
    ...items.map((item) =>
      [
        "<sitemap>",
        tag("loc", absoluteUrl(item.path)),
        item.lastModified ? tag("lastmod", tehranIso(item.lastModified)) : "",
        "</sitemap>",
      ].join(""),
    ),
    "</sitemapindex>",
  ].join("\n");

export const xmlResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
