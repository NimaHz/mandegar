import type { Locale } from "@/i18n/config";

export interface StatusContent {
  offlineMeta: string;
  offlineLinks: string;
  notFoundLinks: string;
  notFoundSearch: string;
  errorCode: string;
}

export const statusContent: Record<Locale, StatusContent> = {
  fa: {
    offlineMeta: "آفلاین",
    offlineLinks: "شاید این صفحه‌ها روی دستگاهت ذخیره شده باشند",
    notFoundLinks: "شاید دنبال یکی از این‌ها بودی",
    notFoundSearch: "جستجو در محصولات",
    errorCode: "کد پیگیری خطا",
  },
  en: {
    offlineMeta: "Offline",
    offlineLinks: "These pages may already be saved on your device",
    notFoundLinks: "Maybe you were looking for one of these",
    notFoundSearch: "Search products",
    errorCode: "Error reference",
  },
};
