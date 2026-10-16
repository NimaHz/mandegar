import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

export const MARKDOWN_EXTENSION = ".md";

export type MarkdownPage =
  { kind: "product" | "category" | "guide" | "post"; slug: string } | { kind: "faq" };

const DETAIL_PATH = /^\/(products|categories|guides|blog)\/([^/?#.]+)$/;

const DETAIL_KIND = {
  products: "product",
  categories: "category",
  guides: "guide",
  blog: "post",
} as const;

const isSection = (value: string): value is keyof typeof DETAIL_KIND => value in DETAIL_KIND;

/** The page a locale-free path describes, when that page has a Markdown copy. */
export const markdownPage = (path: string): MarkdownPage | null => {
  if (path === routes.faq) return { kind: "faq" };
  const [, section, slug] = DETAIL_PATH.exec(path) ?? [];
  if (!section || !slug || !isSection(section)) return null;
  return { kind: DETAIL_KIND[section], slug };
};

export const markdownPath = (locale: Locale, path: string) =>
  markdownPage(path) ? `${localizePath(locale, path)}${MARKDOWN_EXTENSION}` : null;

/** Internal route the proxy rewrites `.md` URLs and `Accept: text/markdown` requests to. */
export const markdownRoute = (locale: Locale, path: string) => `/md/${locale}${path}`;
