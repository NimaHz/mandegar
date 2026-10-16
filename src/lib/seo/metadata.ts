import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { type Locale, localeMeta, locales } from "@/i18n/config";
import { languageAlternates, localizePath } from "@/i18n/paths";

import { feedPath } from "./feed";
import { markdownPath } from "./markdown-paths";
import { OG_HEIGHT, OG_WIDTH, ogImagePath, ogPageKey, type OgTarget } from "./og/targets";
import { summarize, truncate } from "./text";

export { absoluteUrl } from "./urls";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 155;

interface PageMetadataInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  og?: OgTarget;
  image?: { url: string; width?: number; height?: number; alt?: string } | null;
  type?: "website" | "article" | "profile";
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  section?: string;
  noindex?: boolean;
}

const pageTitle = (locale: Locale, title: string): Metadata["title"] => {
  const suffixed = `${title} | ${siteConfig.name[locale]}`;
  if (suffixed.length <= TITLE_MAX) return title;
  return { absolute: truncate(title, TITLE_MAX) };
};

const noindexRobots: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: { index: false, follow: true },
};

export const pageMetadata = ({
  locale,
  path,
  title,
  description,
  og,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  authors,
  section,
  noindex = false,
}: PageMetadataInput): Metadata => {
  const url = localizePath(locale, path);
  const heading = title.trim();
  const summary = summarize(description.trim(), DESCRIPTION_MAX);
  const alt = heading || siteConfig.name[locale];
  const markdown = noindex ? null : markdownPath(locale, path);
  const text = { ...(heading && { title: heading }), ...(summary && { description: summary }) };
  const card = {
    url: ogImagePath(locale, og ?? { kind: "page", key: ogPageKey(path) }),
    width: OG_WIDTH,
    height: OG_HEIGHT,
    alt,
    type: "image/png",
  };
  const extra = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt ?? alt }]
    : [];

  return {
    ...(heading && { title: pageTitle(locale, heading) }),
    ...(summary && { description: summary }),
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
      types: {
        "application/rss+xml": feedPath(locale),
        ...(markdown && { "text/markdown": markdown }),
      },
    },
    openGraph: {
      type,
      url,
      ...text,
      siteName: siteConfig.name[locale],
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => localeMeta[other].ogLocale),
      images: [card, ...extra],
      ...(type === "article" && {
        publishedTime: publishedTime ?? undefined,
        modifiedTime: modifiedTime ?? undefined,
        authors,
        section,
      }),
    },
    twitter: {
      card: "summary_large_image",
      ...text,
      images: [{ url: card.url, alt }],
    },
    ...(noindex && { robots: noindexRobots }),
  };
};
