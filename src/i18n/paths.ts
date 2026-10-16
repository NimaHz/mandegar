import type { Route } from "next";

import { defaultLocale, type Locale, localeMeta, locales } from "./config";

const ROOT_PATH = /^\/(?:[?#]|$)/;

export const localizePath = (locale: Locale, path: string) => {
  const bare = stripLocalePrefix(path);
  if (locale === defaultLocale) return bare as Route;
  return `/${locale}${ROOT_PATH.test(bare) ? bare.slice(1) : bare}` as Route;
};

export const languageAlternates = (path: string) =>
  Object.fromEntries([
    ...locales.map((locale) => [localeMeta[locale].hreflang, localizePath(locale, path)]),
    ["x-default", localizePath(defaultLocale, path)],
  ]);

export const stripLocalePrefix = (pathname: string) => {
  const segment = /^\/([^/?#]+)/.exec(pathname)?.[1];
  if (!segment || !locales.some((locale) => locale === segment)) return pathname || "/";
  const rest = pathname.slice(segment.length + 1);
  return rest.startsWith("/") ? rest : `/${rest}`;
};
