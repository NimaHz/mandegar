type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export const fa = {
  site: {
    name: "ماندگار",
    slogan: "کیفیتی که در خانه می‌ماند",
    title: "ماندگار | لوازم خانگی",
    description: "ماندگار، لوازم خانگی بادوام با گارانتی و خدمات پس از فروش.",
  },
  nav: {
    home: "خانه",
    products: "محصولات",
    warranty: "گارانتی",
    support: "پشتیبانی",
    about: "درباره ما",
    contact: "تماس با ما",
  },
  common: {
    skipToContent: "رفتن به محتوای اصلی",
    backHome: "بازگشت به خانه",
    comingSoon: "به‌زودی",
    switchLanguage: "تغییر زبان",
    notFoundTitle: "این صفحه پیدا نشد",
    notFoundDescription: "آدرس اشتباه است یا این صفحه دیگر وجود ندارد.",
  },
} as const;

export type Dictionary = Widen<typeof fa>;
