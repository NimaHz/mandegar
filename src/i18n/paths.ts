import type { Route } from "next";

import { defaultLocale, type Locale, localeMeta, locales } from "./config";

export const localizePath = (locale: Locale, path: string) => {
  const localized = locale === defaultLocale ? path : `/${locale}${path === "/" ? "" : path}`;
  return localized as Route;
};

export const languageAlternates = (path: string) =>
  Object.fromEntries([
    ...locales.map((locale) => [localeMeta[locale].hreflang, localizePath(locale, path)]),
    ["x-default", localizePath(defaultLocale, path)],
  ]);
