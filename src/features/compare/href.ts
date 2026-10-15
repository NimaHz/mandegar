import type { Route } from "next";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

export const MODELS_PARAM = "models";

export const compareHref = (locale: Locale, slugs: readonly string[]) => {
  const path = localizePath(locale, routes.compare);
  if (slugs.length === 0) return path;
  return `${path}?${MODELS_PARAM}=${slugs.map(encodeURIComponent).join(",")}` as Route;
};
