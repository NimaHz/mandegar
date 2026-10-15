import { isLocale, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fa";

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;
const OG_VERSION = "1";

export const ogEntityKinds = ["product", "category", "brand", "guide", "post", "author"] as const;
export type OgEntityKind = (typeof ogEntityKinds)[number];

export const ogPages = {
  home: null,
  products: "products",
  brands: "brands",
  compare: "compare",
  warranty: "warranty",
  support: "support",
  "support-request": "serviceRequest",
  "support-track": "track",
  guides: "guides",
  "service-centers": "serviceCenters",
  blog: "blog",
  about: "about",
  contact: "contact",
  faq: "faq",
  terms: "terms",
  privacy: "privacy",
  glossary: "glossary",
} as const satisfies Record<string, keyof Dictionary["nav"] | null>;

export type OgPageKey = keyof typeof ogPages;

export type OgTarget =
  | { kind: "page"; key: OgPageKey }
  | { kind: OgEntityKind; slug: string; updatedAt?: string | null };

const SLUG = /^[\p{Ll}\p{Lo}\p{N}][\p{Ll}\p{Lo}\p{N}-]{0,119}$/u;

const isOgPageKey = (value: string): value is OgPageKey => Object.hasOwn(ogPages, value);

const isEntityKind = (value: string): value is OgEntityKind =>
  ogEntityKinds.some((kind) => kind === value);

export const ogPageKey = (path: string): OgPageKey => {
  const [pathname = ""] = path.split(/[?#]/);
  const key = pathname.replace(/^\/+|\/+$/g, "").replaceAll("/", "-") || "home";
  return isOgPageKey(key) ? key : "home";
};

const versionOf = (target: OgTarget) => {
  if (target.kind === "page" || !target.updatedAt) return OG_VERSION;
  const time = Date.parse(target.updatedAt);
  return Number.isNaN(time) ? OG_VERSION : `${OG_VERSION}.${time.toString(36)}`;
};

export const ogImagePath = (locale: Locale, target: OgTarget) => {
  const name = target.kind === "page" ? target.key : target.slug;
  return `/og/${locale}/${target.kind}/${encodeURIComponent(name)}.png?v=${versionOf(target)}`;
};

export const parseOgPath = (segments: string[]): { locale: Locale; target: OgTarget } | null => {
  const [locale, kind, file, ...rest] = segments;
  if (rest.length > 0 || !locale || !kind || !file?.endsWith(".png")) return null;
  if (!isLocale(locale)) return null;
  const name = file.slice(0, -4);
  if (kind === "page") return isOgPageKey(name) ? { locale, target: { kind, key: name } } : null;
  if (!isEntityKind(kind) || !SLUG.test(name)) return null;
  return { locale, target: { kind, slug: name } };
};
