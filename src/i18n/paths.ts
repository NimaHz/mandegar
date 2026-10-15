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

export const stripLocalePrefix = (pathname: string) => {
  const segment = pathname.split("/")[1];
  if (!segment || !locales.some((locale) => locale === segment)) return pathname || "/";
  const rest = pathname.slice(segment.length + 1);
  return rest || "/";
};
