import { type NextRequest, NextResponse } from "next/server";

import { defaultLocale, isLocale, type Locale, localeHeader, locales } from "@/i18n/config";
import { ADMIN_HINT_COOKIE, SESSION_COOKIE_NAMES } from "@/lib/admin-hint";
import { adminPathHeader } from "@/lib/routes";

const SLUG_PATH = new RegExp(
  `^((?:/(?:${locales.join("|")}))?/(?:products|categories|brands|guides|blog|authors)/)([^/]+)$`,
);
const UPPERCASE_OR_ESCAPE = /%[0-9A-Fa-f]{2}|[A-Z]+/g;
const EDGE_SPACES =
  /^(?:%(?:20|09|0[A-Da-d])|%[Cc]2%[Aa]0)+|(?:%(?:20|09|0[A-Da-d])|%[Cc]2%[Aa]0)+$/g;

const canonicalSlug = (slug: string) =>
  slug
    .replace(UPPERCASE_OR_ESCAPE, (match) => (match.startsWith("%") ? match : match.toLowerCase()))
    .replace(EDGE_SPACES, "");

const canonicalPath = (pathname: string) =>
  pathname.replace(SLUG_PATH, (_, prefix: string, slug: string) => prefix + canonicalSlug(slug));

const ADMIN_PATH = /^\/admin(?:\/|$)/;

const withAdminPath = (request: NextRequest) => {
  const search = new URLSearchParams(request.nextUrl.search);
  search.delete("_rsc");
  const query = search.toString();
  const headers = new Headers(request.headers);
  headers.set(adminPathHeader, `${request.nextUrl.pathname}${query ? `?${query}` : ""}`);
  return NextResponse.next({ request: { headers } });
};

const withLocale = (request: NextRequest, locale: Locale, rewrite?: URL) => {
  const headers = new Headers(request.headers);
  headers.set(localeHeader, locale);
  return rewrite
    ? NextResponse.rewrite(rewrite, { request: { headers } })
    : NextResponse.next({ request: { headers } });
};

const ADMIN_HINT_MAX_AGE_SEC = 30 * 86_400;

const syncAdminHint = (request: NextRequest, response: NextResponse) => {
  const signedIn = SESSION_COOKIE_NAMES.some((name) => request.cookies.has(name));
  const hinted = request.cookies.get(ADMIN_HINT_COOKIE)?.value === "1";
  if (signedIn === hinted) return response;
  response.cookies.set(ADMIN_HINT_COOKIE, signedIn ? "1" : "", {
    path: "/",
    sameSite: "lax",
    secure: request.nextUrl.protocol === "https:",
    maxAge: signedIn ? ADMIN_HINT_MAX_AGE_SEC : 0,
  });
  return response;
};

export function proxy(request: NextRequest) {
  return syncAdminHint(request, route(request));
}

function route(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (ADMIN_PATH.test(pathname)) return withAdminPath(request);

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

  if (isLocale(segment)) return withLocale(request, segment);

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
  return withLocale(request, defaultLocale, url);
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/|uploads(?:/|$)|w(?:/|$)|sw\\.js$|manifest\\.webmanifest$|robots\\.txt$|sitemap.*\\.xml$|llms.*\\.txt$|.*\\..*).*)",
  ],
};
