import { type NextRequest, NextResponse } from "next/server";

import { defaultLocale, isLocale, locales } from "@/i18n/config";

const SLUG_PATH = new RegExp(`^((?:/(?:${locales.join("|")}))?/(?:products|categories)/)([^/]+)$`);
const UPPERCASE_OR_ESCAPE = /%[0-9A-Fa-f]{2}|[A-Z]+/g;

const lowercaseSlug = (slug: string) =>
  slug.replace(UPPERCASE_OR_ESCAPE, (match) =>
    match.startsWith("%") ? match : match.toLowerCase(),
  );

const canonicalPath = (pathname: string) =>
  pathname.replace(SLUG_PATH, (_, prefix: string, slug: string) => prefix + lowercaseSlug(slug));

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/W/")) {
    const url = request.nextUrl.clone();
    url.pathname = `/w/${pathname.slice(3)}`;
    return NextResponse.redirect(url, 308);
  }
  const segment = pathname.split("/")[1];
  const unprefixed =
    segment === defaultLocale ? pathname.slice(defaultLocale.length + 1) || "/" : pathname;
  const canonical = canonicalPath(unprefixed);

  if (canonical !== pathname) {
    const url = request.nextUrl.clone();
    url.pathname = canonical;
    return NextResponse.redirect(url, 308);
  }

  if (isLocale(segment)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|admin(?:/|$)|_next/|uploads(?:/|$)|w(?:/|$)|sw\\.js$|manifest\\.webmanifest$|robots\\.txt$|sitemap.*\\.xml$|llms.*\\.txt$|.*\\..*).*)",
  ],
};
