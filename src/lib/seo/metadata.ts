import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { type Locale, localeMeta, locales } from "@/i18n/config";
import { languageAlternates, localizePath } from "@/i18n/paths";

interface PageMetadataInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: { url: string; width?: number; height?: number; alt?: string } | null;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  noindex?: boolean;
}

export const absoluteUrl = (path: string) => new URL(path, siteConfig.url).toString();

export const pageMetadata = ({
  locale,
  path,
  title,
  description,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  noindex = false,
}: PageMetadataInput): Metadata => {
  const url = localizePath(locale, path);
  const images = image
    ? [{ url: image.url, width: image.width, height: image.height, alt: image.alt ?? title }]
    : undefined;

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type,
      url,
      title,
      description,
      siteName: siteConfig.name[locale],
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => localeMeta[other].ogLocale),
      ...(images && { images }),
      ...(type === "article" && { publishedTime, modifiedTime }),
    },
    twitter: { card: "summary_large_image", title, description, ...(images && { images }) },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
};
