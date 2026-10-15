export const locales = ["fa", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "fa";

export const localeMeta: Record<
  Locale,
  { dir: "rtl" | "ltr"; label: string; hreflang: string; ogLocale: string; intl: string }
> = {
  fa: { dir: "rtl", label: "فارسی", hreflang: "fa-IR", ogLocale: "fa_IR", intl: "fa-IR" },
  en: { dir: "ltr", label: "English", hreflang: "en", ogLocale: "en_US", intl: "en" },
};

export const isLocale = (value: unknown): value is Locale =>
  locales.some((locale) => locale === value);
