import "server-only";

import { type Locale, locales } from "@/i18n/config";
import { routes } from "@/lib/routes";

import { latest, type SiteSnapshot } from "./snapshot";

export const sitemapNames = [
  "pages",
  "categories",
  "products",
  "brands",
  "guides",
  "posts",
  "authors",
  "service-centers",
] as const;

export type SitemapName = (typeof sitemapNames)[number];

export interface SitemapVideo {
  thumbnail: string;
  title: string;
  description: string;
  contentUrl: string | null;
  playerUrl: string | null;
  durationSec: number | null;
  publishedAt: string | null;
}

export interface SitemapEntry {
  path: string;
  lastModified: string | null;
  images: string[];
  videos: Partial<Record<Locale, SitemapVideo>>;
}

const APARAT_EMBED = "https://www.aparat.com/video/video/embed/videohash";

const entry = (
  path: string,
  lastModified: string | null,
  extra: Partial<Pick<SitemapEntry, "images" | "videos">> = {},
): SitemapEntry => ({ path, lastModified, images: [], videos: {}, ...extra });

const unique = (items: string[]) => [...new Set(items)];

export const isSitemapName = (value: string): value is SitemapName =>
  sitemapNames.some((name) => name === value);

export const buildSitemaps = (snapshot: SiteSnapshot): Record<SitemapName, SitemapEntry[]> => {
  const { fa } = snapshot;
  const productsModified = latest(...fa.products.map((product) => product.updatedAt));
  const guidesModified = latest(...fa.guides.map((guide) => guide.updatedAt));
  const postsModified = latest(...fa.posts.map((post) => post.updatedAt));
  const brandsModified = latest(...fa.brands.map((brand) => brand.updatedAt));

  return {
    pages: [
      entry(routes.home, latest(productsModified, postsModified, guidesModified)),
      entry(routes.products, productsModified),
      entry(routes.warranty, null),
      entry(routes.support, null),
      entry(routes.serviceRequest, null),
      entry(routes.about, null),
      entry(routes.contact, null),
      entry(routes.faq, null),
      entry(routes.glossary, null),
      entry(routes.terms, null),
      entry(routes.privacy, null),
    ],
    categories: fa.categories.map((category) =>
      entry(routes.category(category.slug), category.updatedAt, {
        images: category.image ? [category.image.src] : [],
      }),
    ),
    products: fa.products.map((product) =>
      entry(routes.product(product.slug), product.updatedAt, {
        images: unique([
          ...(product.image ? [product.image.src] : []),
          ...product.gallery.map((image) => image.src),
        ]),
      }),
    ),
    brands: [
      entry(routes.brands, brandsModified),
      ...fa.brands.map((brand) =>
        entry(routes.brand(brand.slug), brand.updatedAt, {
          images: brand.logo ? [brand.logo.src] : [],
        }),
      ),
    ],
    guides: [
      entry(routes.guides, guidesModified),
      ...fa.guides.map((guide) =>
        entry(routes.guide(guide.slug), guide.updatedAt, {
          images: unique([
            ...(guide.poster ? [guide.poster.src] : []),
            ...guide.steps.flatMap((step) => (step.image ? [step.image.src] : [])),
          ]),
          videos: Object.fromEntries(
            locales.flatMap((locale) => {
              const localized = snapshot[locale].guides.find((item) => item.slug === guide.slug);
              const video = localized?.video;
              const poster = video?.poster ?? localized?.poster;
              if (!localized || !video || !poster) return [];
              const sitemapVideo: SitemapVideo = {
                thumbnail: poster.src,
                title: localized.title,
                description: localized.summary,
                contentUrl: video.kind === "upload" ? video.src : null,
                playerUrl:
                  video.kind === "aparat"
                    ? `${APARAT_EMBED}/${encodeURIComponent(video.hash)}/vt/frame`
                    : null,
                durationSec: localized.durationSec,
                publishedAt: localized.publishedAt ?? localized.updatedAt,
              };
              return [[locale, sitemapVideo]];
            }),
          ),
        }),
      ),
    ],
    posts: [
      entry(routes.blog, postsModified),
      ...fa.posts.map((post) =>
        entry(routes.post(post.slug), post.updatedAt, {
          images: post.cover ? [post.cover.src] : [],
        }),
      ),
    ],
    authors: fa.authors.map(({ author, posts }) =>
      entry(routes.author(author.slug), latest(...posts.map((post) => post.publishedAt)), {
        images: author.avatar ? [author.avatar.src] : [],
      }),
    ),
    "service-centers": [entry(routes.serviceCenters, null)],
  };
};
