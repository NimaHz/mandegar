import type { Locale } from "@/i18n/config";

export interface PwaContent {
  updateTitle: string;
  updateDescription: string;
  updateAction: string;
  screenshots: { narrow: string; wide: string };
}

export const pwaContent = {
  fa: {
    updateTitle: "نسخهٔ تازه‌ای آماده است",
    updateDescription: "برای دیدن آخرین تغییرات، صفحه را دوباره بارگذاری کنید.",
    updateAction: "بارگذاری",
    screenshots: {
      narrow: "صفحهٔ اصلی ماندگار روی گوشی",
      wide: "صفحهٔ اصلی ماندگار روی دسکتاپ",
    },
  },
  en: {
    updateTitle: "A new version is ready",
    updateDescription: "Reload to get the latest changes.",
    updateAction: "Reload",
    screenshots: {
      narrow: "Mandegar home page on a phone",
      wide: "Mandegar home page on a desktop",
    },
  },
} satisfies Record<Locale, PwaContent>;
