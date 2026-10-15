import { type Locale, localeMeta } from "@/i18n/config";

import { tehranIso } from "../text";
import { absoluteUrl } from "../urls";
import { ref, siteIds, webPageId } from "./ids";
import type { JsonLdNode, JsonLdRef } from "./types";

interface ArticleInput {
  type: "TechArticle" | "BlogPosting";
  id: string;
  locale: Locale;
  url: string;
  headline: string;
  description: string;
  image?: string | null;
  datePublished?: string | null;
  dateModified: string;
  author: JsonLdRef | JsonLdNode;
  section?: string | null;
  wordCount?: number | null;
  about?: (JsonLdRef | JsonLdNode)[];
  isPartOf?: JsonLdRef | null;
  hasPart?: JsonLdRef[];
  video?: JsonLdRef | null;
}

export const articleNode = ({
  type,
  id,
  locale,
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  section,
  wordCount,
  about,
  isPartOf,
  hasPart,
  video,
}: ArticleInput): JsonLdNode => ({
  "@type": type,
  "@id": id,
  url,
  headline: headline.length > 110 ? `${headline.slice(0, 109)}…` : headline,
  name: headline,
  description,
  image: image ? absoluteUrl(image) : null,
  datePublished: tehranIso(datePublished ?? dateModified),
  dateModified: tehranIso(dateModified),
  author,
  publisher: ref(siteIds.organization),
  inLanguage: localeMeta[locale].hreflang,
  mainEntityOfPage: ref(webPageId(url)),
  articleSection: section,
  wordCount,
  about,
  isPartOf,
  hasPart,
  video,
});
