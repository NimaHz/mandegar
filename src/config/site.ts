import type { Locale } from "@/i18n/config";
import { THEME_COLORS } from "@/lib/theme";

export const siteConfig = {
  name: { fa: "ماندگار", en: "Mandegar" } satisfies Record<Locale, string>,
  latinName: "Mandegar",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  themeColor: THEME_COLORS.light,
  contact: {
    isPlaceholder: true,
    phone: "+98 21 0000 0000",
    email: "placeholder@mandegar.example",
    address: {
      fa: "نشانی موقت؛ پیش از انتشار جایگزین شود",
      en: "Placeholder address; replace before launch",
    } satisfies Record<Locale, string>,
  },
} as const;
