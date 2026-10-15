import type { Route } from "next";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";

export const localizeHref = (locale: Locale, href: string): Route =>
  href.startsWith("/") && !href.startsWith("//") ? localizePath(locale, href) : (href as Route);
