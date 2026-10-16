import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/i18n/plural";
import type { FaqGroup } from "@/types/content";

export interface FaqContent {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  groups: Record<FaqGroup, { title: string; description: string }>;
  navLabel: string;
  searchLabel: string;
  searchPlaceholder: string;
  clearSearch: string;
  resultCount: PluralForms;
  emptyTitle: string;
  emptyDescription: string;
  ctaTitle: string;
  ctaBody: string;
  ctaContact: string;
  ctaService: string;
}

export const faqContent: Record<Locale, FaqContent> = {
  fa: {
    metaTitle: "پرسش‌های متداول",
    metaDescription: "پاسخ پرسش‌های رایج درباره گارانتی، نصب، محصولات و خدمات پس از فروش ماندگار.",
    eyebrow: "مرکز پاسخ‌ها",
    title: "پرسش‌های متداول",
    description:
      "پاسخ بیشتر پرسش‌ها درباره گارانتی، نصب و خدمات همین‌جاست. اگر پیدا نکردی، مستقیم از ما بپرس.",
    groups: {
      general: { title: "عمومی", description: "خرید، تولید و آشنایی با ماندگار" },
      warranty: { title: "گارانتی", description: "کد گارانتی، شروع و شرایط پوشش" },
      installation: { title: "نصب", description: "هزینه، نصب‌کننده و نکته‌های ایمنی" },
      products: { title: "محصولات", description: "انتخاب مدل، قطعات و مقایسه" },
      support: { title: "خدمات پس از فروش", description: "ثبت و پیگیری درخواست تعمیر" },
    },
    navLabel: "موضوع‌ها",
    searchLabel: "جستجو در پرسش‌ها",
    searchPlaceholder: "مثلاً کد گارانتی یا نصب بخاری",
    clearSearch: "پاک کردن جستجو",
    resultCount: { one: "{count} پاسخ پیدا شد", other: "{count} پاسخ پیدا شد" },
    emptyTitle: "پاسخی با این عبارت پیدا نشد",
    emptyDescription: "واژه دیگری را امتحان کن یا پرسشت را مستقیم برای ما بفرست.",
    ctaTitle: "پاسخت را پیدا نکردی؟",
    ctaBody:
      "برای پرسش‌های عمومی پیام بفرست؛ برای خرابی و تعمیر، درخواست خدمات ثبت کن تا کد رهگیری بگیری.",
    ctaContact: "تماس با ما",
    ctaService: "ثبت درخواست خدمات",
  },
  en: {
    metaTitle: "Frequently asked questions",
    metaDescription:
      "Answers to common questions about Mandegar warranty, installation, products and after-sales service.",
    eyebrow: "Help centre",
    title: "Frequently asked questions",
    description:
      "Most answers about warranty, installation and service are right here. If yours isn't, ask us directly.",
    groups: {
      general: { title: "General", description: "Buying, manufacturing and Mandegar itself" },
      warranty: { title: "Warranty", description: "Warranty codes, start dates and coverage" },
      installation: { title: "Installation", description: "Cost, installers and safety notes" },
      products: { title: "Products", description: "Choosing a model, parts and comparisons" },
      support: { title: "After-sales service", description: "Requesting and tracking repairs" },
    },
    navLabel: "Topics",
    searchLabel: "Search the questions",
    searchPlaceholder: "e.g. warranty code or heater installation",
    clearSearch: "Clear search",
    resultCount: { one: "{count} answer found", other: "{count} answers found" },
    emptyTitle: "No answers match that search",
    emptyDescription: "Try another word, or send us your question directly.",
    ctaTitle: "Didn't find your answer?",
    ctaBody:
      "Send us a message for general questions; for faults and repairs, submit a service request to get a tracking code.",
    ctaContact: "Contact us",
    ctaService: "Request service",
  },
};
