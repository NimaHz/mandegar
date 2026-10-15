import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";

import { localeUrl, siteUrl } from "../urls";
import type { JsonLdRef } from "./types";

export const siteIds = {
  organization: `${siteUrl}/#organization`,
  brand: `${siteUrl}/#brand`,
  logo: `${siteUrl}/#logo`,
  warrantyService: `${siteUrl}/#warranty-service`,
  afterSalesService: `${siteUrl}/#after-sales-service`,
} as const;

export const ref = (id: string): JsonLdRef => ({ "@id": id });

export const nodeId = (url: string, fragment: string) => `${url}#${fragment}`;

export const websiteId = (locale: Locale) => nodeId(localeUrl(locale, routes.home), "website");

export const webPageId = (url: string) => nodeId(url, "webpage");

export const breadcrumbId = (url: string) => nodeId(url, "breadcrumb");

export const productId = (locale: Locale, slug: string) =>
  nodeId(localeUrl(locale, routes.product(slug)), "product");

export const brandId = (locale: Locale, brand: { slug: string; isOwn: boolean }) =>
  brand.isOwn ? siteIds.brand : nodeId(localeUrl(locale, routes.brand(brand.slug)), "brand");

export const guideArticleId = (locale: Locale, slug: string) =>
  nodeId(localeUrl(locale, routes.guide(slug)), "article");

export const guideVideoId = (locale: Locale, slug: string) =>
  nodeId(localeUrl(locale, routes.guide(slug)), "video");

export const postId = (locale: Locale, slug: string) =>
  nodeId(localeUrl(locale, routes.post(slug)), "article");

export const personId = (locale: Locale, slug: string) =>
  nodeId(localeUrl(locale, routes.author(slug)), "person");

export const blogId = (locale: Locale) => nodeId(localeUrl(locale, routes.blog), "blog");
