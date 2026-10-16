import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/i18n/plural";

export interface LayoutContent {
  homeLabel: string;
  topBar: { support: string; quickWarranty: string; quickTrack: string };
  header: {
    navLabel: string;
    productsMenu: string;
    productsTitle: string;
    productsDescription: string;
    modelsCount: PluralForms;
    allProducts: string;
    compareProducts: string;
    findCenter: string;
    supportMenu: string;
    supportHints: Record<string, string>;
    warrantyCta: string;
    search: string;
    searchTitle: string;
    closeSearch: string;
    searchHint: string;
    searchEmpty: string;
    searchKinds: Record<"product" | "category" | "guide" | "post", string>;
    compare: string;
  };
  mobileMenu: {
    label: string;
    explore: string;
    support: string;
    appearance: string;
    warrantyTitle: string;
    warrantyBody: string;
  };
  bottomNavLabel: string;
  bottomNav: Record<"home" | "products" | "warranty" | "support" | "track", string>;
  footer: {
    tagline: string;
    about: string;
    products: string;
    contactTitle: string;
    socialTitle: string;
    socialLabel: string;
    copyright: string;
    madeIn: string;
  };
}

export const layoutContent: Record<Locale, LayoutContent> = {
  fa: {
    homeLabel: "ماندگار Mandegar، صفحه اصلی",
    topBar: {
      support: "پشتیبانی",
      quickWarranty: "استعلام گارانتی",
      quickTrack: "پیگیری درخواست",
    },
    header: {
      navLabel: "منوی اصلی",
      productsMenu: "محصولات",
      productsTitle: "دسته‌بندی محصولات",
      productsDescription: "هر مدل با مشخصات کامل، راهنمای نصب و کد گارانتی.",
      modelsCount: { one: "{count} مدل", other: "{count} مدل" },
      allProducts: "همه محصولات",
      compareProducts: "مقایسه مدل‌ها",
      findCenter: "نزدیک‌ترین نمایندگی",
      supportMenu: "خدمات پس از فروش",
      supportHints: {
        warranty: "وضعیت گارانتی را با کد محصول ببین",
        serviceRequest: "تعمیر، قطعه یا مشاوره فنی",
        track: "وضعیت درخواست با کد رهگیری",
        serviceCenters: "نمایندگی فروش و خدمات در استان تو",
        guides: "ویدیو و مراحل نصب هر مدل",
        faq: "پاسخ سؤال‌های رایج",
      },
      warrantyCta: "استعلام گارانتی",
      search: "جستجو",
      searchTitle: "جستجو در ماندگار",
      closeSearch: "بستن جستجو",
      searchHint: "نام مدل، کد مدل، دسته یا موضوع راهنما را بنویس.",
      searchEmpty: "چیزی با این عبارت پیدا نشد. املای دیگری را امتحان کن.",
      searchKinds: { product: "محصول", category: "دسته", guide: "راهنما", post: "مقاله" },
      compare: "مقایسه",
    },
    mobileMenu: {
      label: "منوی ماندگار",
      explore: "کاوش",
      support: "خدمات پس از فروش",
      appearance: "ظاهر سایت",
      warrantyTitle: "گارانتی محصولت را بررسی کن",
      warrantyBody: "کد روی برچسب دستگاه را وارد کن تا مدت و پوشش گارانتی را ببینی.",
    },
    bottomNavLabel: "ناوبری سریع",
    bottomNav: {
      home: "خانه",
      products: "محصولات",
      warranty: "گارانتی",
      support: "خدمات",
      track: "پیگیری",
    },
    footer: {
      tagline: "کیفیتی که در خانه می‌ماند",
      about:
        "ماندگار کولر آبی، بخاری، آبگرمکن و لوازم آشپزخانه را برای خانه‌های ایرانی طراحی و تولید می‌کند و محصولات برندهای همکار را نیز با همان گارانتی و خدمات عرضه می‌کند. هر مدل یک کد گارانتی دارد که وضعیت پوشش آن را نشان می‌دهد، و همه درخواست‌های خدمات پس از فروش با کد رهگیری ثبت و پیگیری می‌شود.",
      products: "محصولات",
      contactTitle: "ارتباط با ما",
      socialTitle: "ماندگار در شبکه‌های اجتماعی",
      socialLabel: "شبکه‌های اجتماعی",
      copyright: "تمامی حقوق برای ماندگار محفوظ است © {year}",
      madeIn: "ساخت ایران",
    },
  },
  en: {
    homeLabel: "Mandegar home",
    topBar: {
      support: "Support",
      quickWarranty: "Warranty check",
      quickTrack: "Track a request",
    },
    header: {
      navLabel: "Main menu",
      productsMenu: "Products",
      productsTitle: "Product categories",
      productsDescription:
        "Every model comes with full specs, an installation guide and a warranty code.",
      modelsCount: { one: "{count} model", other: "{count} models" },
      allProducts: "All products",
      compareProducts: "Compare models",
      findCenter: "Find a service centre",
      supportMenu: "After-sales",
      supportHints: {
        warranty: "Check warranty status with the product code",
        serviceRequest: "Repairs, spare parts or technical advice",
        track: "Request status with your tracking code",
        serviceCenters: "Dealers and service centres in your province",
        guides: "Video and steps for every model",
        faq: "Answers to common questions",
      },
      warrantyCta: "Warranty check",
      search: "Search",
      searchTitle: "Search Mandegar",
      closeSearch: "Close search",
      searchHint: "Type a model name, model code, category or guide topic.",
      searchEmpty: "Nothing matched. Try a different spelling.",
      searchKinds: { product: "Product", category: "Category", guide: "Guide", post: "Article" },
      compare: "Compare",
    },
    mobileMenu: {
      label: "Mandegar menu",
      explore: "Explore",
      support: "After-sales",
      appearance: "Appearance",
      warrantyTitle: "Check your product's warranty",
      warrantyBody: "Enter the code on the product label to see its warranty period and coverage.",
    },
    bottomNavLabel: "Quick navigation",
    bottomNav: {
      home: "Home",
      products: "Products",
      warranty: "Warranty",
      support: "Service",
      track: "Track",
    },
    footer: {
      tagline: "Quality that stays at home",
      about:
        "Mandegar designs and builds evaporative coolers, heaters, water heaters and kitchen appliances for Iranian homes, and offers partner brands with the same warranty and service. Every model carries a warranty code that shows its coverage, and every after-sales request gets a tracking code you can follow.",
      products: "Products",
      contactTitle: "Contact",
      socialTitle: "Mandegar on social media",
      socialLabel: "Social media",
      copyright: "© {year} Mandegar. All rights reserved.",
      madeIn: "Made in Iran",
    },
  },
};
