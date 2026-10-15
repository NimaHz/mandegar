import type { Route } from "next";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

export const serviceRequestHref = (locale: Locale, productSlug: string) =>
  `${localizePath(locale, routes.serviceRequest)}?product=${encodeURIComponent(productSlug)}` as Route;
