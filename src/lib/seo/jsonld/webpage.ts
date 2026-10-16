import { type Locale, localeMeta } from "@/i18n/config";
import type { ImageAsset } from "@/types/common";

import { tehranIso } from "../text";
import { breadcrumbId, ref, siteIds, webPageId, websiteId } from "./ids";
import { imageObject } from "./image";
import type { JsonLdNode, JsonLdRef } from "./types";

export type WebPageType =
  | "WebPage"
  | "CollectionPage"
  | "ItemPage"
  | "AboutPage"
  | "ContactPage"
  | "FAQPage"
  | "ProfilePage"
  | "SearchResultsPage";

interface WebPageInput {
  locale: Locale;
  url: string;
  type?: WebPageType;
  name: string;
  description: string;
  breadcrumb?: boolean;
  mainEntity?: JsonLdRef | JsonLdNode | (JsonLdRef | JsonLdNode)[];
  about?: JsonLdRef | JsonLdRef[];
  image?: ImageAsset | string | null;
  datePublished?: string | null;
  dateModified?: string | null;
}

export const webPageNode = ({
  locale,
  url,
  type = "WebPage",
  name,
  description,
  breadcrumb = false,
  mainEntity,
  about,
  image,
  datePublished,
  dateModified,
}: WebPageInput): JsonLdNode => ({
  "@type": type,
  "@id": webPageId(url),
  url,
  name,
  description,
  inLanguage: localeMeta[locale].hreflang,
  isPartOf: ref(websiteId(locale)),
  publisher: ref(siteIds.organization),
  breadcrumb: breadcrumb ? ref(breadcrumbId(url)) : null,
  mainEntity,
  about,
  primaryImageOfPage: image ? imageObject(image) : null,
  datePublished: datePublished ? tehranIso(datePublished) : null,
  dateModified: dateModified ? tehranIso(dateModified) : null,
});
