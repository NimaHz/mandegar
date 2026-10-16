import "server-only";

import { cache } from "react";

import type { Locale } from "@/i18n/config";
import { api } from "@/services";
import type { BrandDetail, CategoryDetail, ProductDetail } from "@/types/catalog";
import type {
  AuthorDetail,
  Faq,
  GuideDetail,
  PostDetail,
  PostListItem,
  ServiceCenter,
  SiteSettings,
} from "@/types/content";
import type { WarrantyPolicySummary } from "@/types/warranty";

export interface LocaleSnapshot {
  settings: SiteSettings;
  products: ProductDetail[];
  categories: CategoryDetail[];
  brands: BrandDetail[];
  guides: GuideDetail[];
  posts: PostDetail[];
  authors: { author: AuthorDetail; posts: PostListItem[] }[];
  faqs: Faq[];
  serviceCenters: ServiceCenter[];
  policies: WarrantyPolicySummary[];
}

export type SiteSnapshot = Record<Locale, LocaleSnapshot>;

const present = <TItem>(items: (TItem | null)[]) =>
  items.filter((item): item is NonNullable<TItem> => item !== null);

const loadLocale = async (
  locale: Locale,
  slugs: Record<"products" | "categories" | "brands" | "guides" | "posts" | "authors", string[]>,
): Promise<LocaleSnapshot> => {
  const [
    settings,
    products,
    categories,
    brands,
    guides,
    posts,
    authors,
    faqs,
    serviceCenters,
    policies,
  ] = await Promise.all([
    api.content.settings(locale),
    Promise.all(slugs.products.map((slug) => api.catalog.product(locale, slug))),
    Promise.all(slugs.categories.map((slug) => api.catalog.category(locale, slug))),
    Promise.all(slugs.brands.map((slug) => api.catalog.brand(locale, slug))),
    Promise.all(slugs.guides.map((slug) => api.content.guide(locale, slug))),
    Promise.all(slugs.posts.map((slug) => api.content.post(locale, slug))),
    Promise.all(
      slugs.authors.map(async (slug) => {
        const [author, authorPosts] = await Promise.all([
          api.content.author(locale, slug),
          api.content.authorPosts(locale, slug),
        ]);
        return author ? { author, posts: authorPosts } : null;
      }),
    ),
    api.content.faqs(locale),
    api.content.serviceCenters(locale, { province: null, kind: null }),
    api.warranty.policies(locale),
  ]);
  return {
    settings,
    products: present(products),
    categories: present(categories),
    brands: present(brands),
    guides: present(guides),
    posts: present(posts),
    authors: present(authors),
    faqs,
    serviceCenters,
    policies,
  };
};

export const getSiteSnapshot = cache(async (): Promise<SiteSnapshot> => {
  const [{ features }, products, categories, brands, guides, posts, authors] = await Promise.all([
    api.content.settings("fa"),
    api.catalog.productSlugs(),
    api.catalog.categorySlugs(),
    api.catalog.brandSlugs(),
    api.content.guideSlugs(),
    api.content.postSlugs(),
    api.content.authorSlugs(),
  ]);
  const slugs = {
    products,
    categories,
    brands,
    guides,
    posts: features.blog ? posts : [],
    authors: features.blog ? authors : [],
  };
  const [fa, en] = await Promise.all([loadLocale("fa", slugs), loadLocale("en", slugs)]);
  return { fa, en };
});

export const latest = (...dates: (string | null | undefined)[]) =>
  dates.reduce<string | null>((max, date) => (date && (!max || date > max) ? date : max), null);
