import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { PostDetail } from "@/types/content";

import { feedLocale, feedName, feedPath, feedXml } from "./feed";
import type { LocaleSnapshot, SiteSnapshot } from "./snapshot";
import { absoluteUrl } from "./urls";

const post = (slug: string, title: string, publishedAt: string): PostDetail => ({
  slug,
  kind: "news",
  title,
  excerpt: `${title} <excerpt> & more`,
  cover: { src: `/uploads/${slug}.webp`, alt: title, width: 1200, height: 675 },
  author: { slug: "sara", name: "سارا احمدی", role: "", avatar: null },
  readingMinutes: 3,
  publishedAt,
  body: "",
  relatedProducts: [],
  seo: { title: null, description: null },
  updatedAt: publishedAt,
});

const snapshot = (posts: PostDetail[]): SiteSnapshot => {
  const empty = { posts: [] } as unknown as LocaleSnapshot;
  return { fa: { ...empty, posts }, en: empty };
};

const copy = { title: "مجله ماندگار", description: "توضیح", kind: () => "خبر" };

describe("feedXml", () => {
  it("lists the newest posts first with escaped text and RFC 822 dates", () => {
    const xml = feedXml(
      "fa",
      snapshot([
        post("old", "Old & <first>", "2026-01-02T08:00:00.000Z"),
        post("new", "تازه", "2026-03-04T08:00:00.000Z"),
      ]),
      copy,
    );
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"'));
    assert.ok(
      xml.indexOf("<title>تازه</title>") < xml.indexOf("<title>Old &amp; &lt;first&gt;</title>"),
    );
    assert.ok(xml.includes("<pubDate>Wed, 04 Mar 2026 08:00:00 GMT</pubDate>"));
    assert.ok(xml.includes("<lastBuildDate>Wed, 04 Mar 2026 08:00:00 GMT</lastBuildDate>"));
    assert.ok(xml.includes("<description>تازه &lt;excerpt&gt; &amp; more</description>"));
    assert.ok(xml.includes("<language>fa-IR</language>"));
    assert.ok(xml.includes(`<atom:link href="${absoluteUrl(feedPath("fa"))}" rel="self"`));
    assert.ok(xml.includes(`<media:content url="${absoluteUrl("/uploads/new.webp")}"`));
    assert.equal(xml.match(/<item>/g)?.length, 2);
  });

  it("keeps the 30 newest posts", () => {
    const posts = Array.from({ length: 35 }, (_, index) =>
      post(`p${index}`, `Post ${index}`, new Date(Date.UTC(2026, 0, index + 1)).toISOString()),
    );
    const xml = feedXml("fa", snapshot(posts), copy);
    assert.equal(xml.match(/<item>/g)?.length, 30);
    assert.ok(xml.includes("<title>Post 34</title>"));
    assert.ok(!xml.includes("<title>Post 4</title>"));
  });

  it("resolves feed names to locales", () => {
    assert.equal(feedLocale(feedName("en")), "en");
    assert.equal(feedLocale(feedName("fa")), "fa");
    assert.equal(feedLocale("blog-de.xml"), null);
  });
});
