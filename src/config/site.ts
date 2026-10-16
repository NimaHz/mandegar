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
    phoneLabel: { fa: "دفتر مرکزی", en: "Head office" } satisfies Record<Locale, string>,
    email: "placeholder@mandegar.example",
    emailLabel: { fa: "پشتیبانی", en: "Support" } satisfies Record<Locale, string>,
    address: {
      fa: "نشانی موقت؛ پیش از انتشار جایگزین شود",
      en: "Placeholder address; replace before launch",
    } satisfies Record<Locale, string>,
    hours: {
      fa: "شنبه تا چهارشنبه، ۸ تا ۱۷",
      en: "Saturday to Wednesday, 8:00 to 17:00",
    } satisfies Record<Locale, string>,
  },
} as const;
