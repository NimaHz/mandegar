import { type NextRequest, NextResponse } from "next/server";

import { defaultLocale, isLocale } from "@/i18n/config";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segment = pathname.split("/")[1];

  if (segment === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(defaultLocale.length + 1) || "/";
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
