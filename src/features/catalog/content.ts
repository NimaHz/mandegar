import type { Locale } from "@/i18n/config";
import type { ProductSort } from "@/types/catalog";

import type { PluralForms } from "./plural";

export interface CatalogContent {
  card: {
    newBadge: string;
    partner: string;
    energy: string;
    warranty: string;
    details: string;
  };
  listing: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    resultsFor: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    searchLabel: string;
    searchPlaceholder: string;
    searchSubmit: string;
    searchClear: string;
    resultsTitle: string;
    count: string;
    countEmpty: string;
    sortLabel: string;
    sorts: Record<ProductSort, string>;
    filters: string;
    filtersTitle: string;
    filtersActive: string;
    showResults: string;
    clearAll: string;
    removeFilter: string;
    activeFilters: string;
    updating: string;
    groups: { category: string; brand: string; energy: string };
    modelsUnit: PluralForms;
    energyHint: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
  };
  category: {
    eyebrow: string;
    modelsCount: PluralForms;
    subcategories: string;
    productsTitle: string;
    productsDescription: string;
    guideEyebrow: string;
    guideTitle: string;
    guideCta: string;
    guideSteps: string;
    guideMinutes: string;
    guideFallbackTitle: string;
    guideFallbackBody: string;
    guideFallbackCta: string;
    faqTitle: string;
    faqDescription: string;
    faqAll: string;
    emptyTitle: string;
    emptyDescription: string;
  };
}

export const catalogContent: Record<Locale, CatalogContent> = {
  fa: {
    card: {
      newBadge: "جدید",
      partner: "برند همکار",
      energy: "رده انرژی {value}",
      warranty: "{count} ماه گارانتی",
      details: "جزئیات",
    },
    listing: {
      eyebrow: "محصولات ماندگار",
      title: "مدل مناسب خانه‌ات را",
      titleHighlight: "پیدا کن",
      resultsFor: "نتایج جستجو برای",
      description:
        "هر مدل با مشخصات فنی کامل، راهنمای نصب، فایل‌های دانلودی و گارانتی رسمی. دسته، برند یا رده انرژی را انتخاب کن.",
      metaTitle: "همه محصولات",
      metaDescription:
        "کولر آبی، بخاری، آبگرمکن، لوازم آشپزخانه و پنکه ماندگار با مشخصات کامل، رده انرژی و گارانتی رسمی.",
      searchLabel: "جستجو در محصولات",
      searchPlaceholder: "نام مدل، کد یا دسته",
      searchSubmit: "جستجو",
      searchClear: "پاک کردن جستجو",
      resultsTitle: "فهرست محصولات",
      count: "{count} مدل",
      countEmpty: "مدلی پیدا نشد",
      sortLabel: "مرتب‌سازی",
      sorts: { featured: "پیشنهاد ماندگار", newest: "جدیدترین", name: "نام مدل" },
      filters: "فیلترها",
      filtersTitle: "فیلتر محصولات",
      filtersActive: "{count} فیلتر فعال",
      showResults: "دیدن {count} مدل",
      clearAll: "حذف همه فیلترها",
      removeFilter: "حذف فیلتر {label}",
      activeFilters: "فیلترهای فعال",
      updating: "در حال به‌روزرسانی نتایج",
      groups: { category: "دسته", brand: "برند", energy: "رده انرژی" },
      modelsUnit: { one: "مدل", other: "مدل" },
      energyHint: "کم‌مصرف‌ترین رده:",
      emptyTitle: "مدلی با این مشخصات پیدا نشد",
      emptyDescription:
        "چند فیلتر را بردار یا عبارت دیگری جستجو کن. اگر دنبال مدل قدیمی هستی، کد مدل را امتحان کن.",
      emptyAction: "حذف فیلترها",
    },
    category: {
      eyebrow: "دسته‌بندی",
      modelsCount: { one: "{count} مدل", other: "{count} مدل" },
      subcategories: "زیرشاخه‌ها",
      productsTitle: "مدل‌های {name}",
      productsDescription: "برند و رده انرژی را انتخاب کن تا مدل‌ها دقیق‌تر شوند.",
      guideEyebrow: "راهنمای نصب",
      guideTitle: "قبل از نصب، این راهنما را ببین",
      guideCta: "دیدن راهنمای کامل",
      guideSteps: "{count} مرحله",
      guideMinutes: "{count} دقیقه",
      guideFallbackTitle: "نصب را به سرویس‌کار مجاز بسپار",
      guideFallbackBody:
        "راهنمای تصویری این دسته به‌زودی منتشر می‌شود. تا آن زمان، نصب استاندارد را از نزدیک‌ترین نمایندگی بخواه.",
      guideFallbackCta: "همه راهنماها",
      faqTitle: "پرسش‌های رایج",
      faqDescription: "پاسخ سؤال‌هایی که بیشتر از ما درباره این دسته می‌پرسند.",
      faqAll: "همه پرسش‌ها",
      emptyTitle: "هنوز مدلی در این دسته منتشر نشده",
      emptyDescription: "به‌زودی مدل‌های تازه اضافه می‌شوند. تا آن زمان سایر دسته‌ها را ببین.",
    },
  },
  en: {
    card: {
      newBadge: "New",
      partner: "Partner brand",
      energy: "Energy class {value}",
      warranty: "{count}-month warranty",
      details: "Details",
    },
    listing: {
      eyebrow: "Mandegar products",
      title: "Find the right model",
      titleHighlight: "for your home",
      resultsFor: "Search results for",
      description:
        "Every model comes with full specs, an installation guide, downloads and an official warranty. Narrow it down by category, brand or energy class.",
      metaTitle: "All products",
      metaDescription:
        "Mandegar evaporative coolers, heaters, water heaters, kitchen appliances and fans, with full specs, energy class and official warranty.",
      searchLabel: "Search products",
      searchPlaceholder: "Model name, code or category",
      searchSubmit: "Search",
      searchClear: "Clear search",
      resultsTitle: "Product list",
      count: "{count} models",
      countEmpty: "No models found",
      sortLabel: "Sort by",
      sorts: { featured: "Recommended", newest: "Newest", name: "Model name" },
      filters: "Filters",
      filtersTitle: "Filter products",
      filtersActive: "{count} active filters",
      showResults: "Show {count} models",
      clearAll: "Clear all filters",
      removeFilter: "Remove filter {label}",
      activeFilters: "Active filters",
      updating: "Updating results",
      groups: { category: "Category", brand: "Brand", energy: "Energy class" },
      modelsUnit: { one: "model", other: "models" },
      energyHint: "Most efficient class:",
      emptyTitle: "No models match these filters",
      emptyDescription:
        "Remove a filter or try a different search. Looking for an older model? Try its model code.",
      emptyAction: "Clear filters",
    },
    category: {
      eyebrow: "Category",
      modelsCount: { one: "{count} model", other: "{count} models" },
      subcategories: "Subcategories",
      productsTitle: "{name} models",
      productsDescription: "Filter by brand and energy class to narrow the list.",
      guideEyebrow: "Installation guide",
      guideTitle: "Watch this before you install",
      guideCta: "Open the full guide",
      guideSteps: "{count} steps",
      guideMinutes: "{count} min",
      guideFallbackTitle: "Leave installation to an authorized technician",
      guideFallbackBody:
        "The video guide for this category is on its way. Until then, ask your nearest dealer for a standard installation.",
      guideFallbackCta: "All guides",
      faqTitle: "Common questions",
      faqDescription: "Answers to what people ask us most about this category.",
      faqAll: "All questions",
      emptyTitle: "No models published in this category yet",
      emptyDescription: "New models are on their way. Meanwhile, explore the other categories.",
    },
  },
};
