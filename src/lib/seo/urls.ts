import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";

export const siteUrl = siteConfig.url.replace(/\/+$/, "");

export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();

export const localeUrl = (locale: Locale, path: string) => absoluteUrl(localizePath(locale, path));
