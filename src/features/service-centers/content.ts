import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/i18n/plural";
import type { ServiceCenterKind } from "@/types/content";

export interface ServiceCentersContent {
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; description: string };
  filters: {
    label: string;
    province: string;
    allProvinces: string;
    kind: string;
    kinds: Record<"all" | "dealer" | "service", string>;
  };
  kindBadge: Record<ServiceCenterKind, string>;
  summary: { title: string; results: PluralForms };
  card: {
    hours: string;
    phones: string;
    categories: string;
    neshan: string;
    balad: string;
    call: string;
  };
  empty: { title: string; description: string; action: string };
  dealer: { eyebrow: string; title: string; body: string; points: string[]; cta: string };
}

export const serviceCentersContent: Record<Locale, ServiceCentersContent> = {
  fa: {
    meta: {
      title: "نمایندگی‌ها و مراکز خدمات",
      description:
        "نشانی، تلفن و ساعت کاری نمایندگی‌های فروش و مراکز خدمات مجاز ماندگار در استان‌های ایران، با مسیریابی در نشان و بلد.",
    },
    hero: {
      eyebrow: "شبکه ماندگار در سراسر ایران",
      title: "نمایندگی‌ها و مراکز خدمات",
      description:
        "نزدیک‌ترین نمایندگی فروش یا مرکز خدمات مجاز ماندگار را در استان خودت پیدا کن؛ با ساعت کاری، تلفن و مسیریابی.",
    },
    filters: {
      label: "فیلتر مراکز",
      province: "استان",
      allProvinces: "همه استان‌ها",
      kind: "نوع مرکز",
      kinds: { all: "همه", dealer: "فروش", service: "خدمات" },
    },
    kindBadge: { dealer: "نمایندگی فروش", service: "مرکز خدمات", both: "فروش و خدمات" },
    summary: {
      title: "مراکز در هر استان",
      results: { one: "{count} مرکز", other: "{count} مرکز" },
    },
    card: {
      hours: "ساعت کاری",
      phones: "تلفن",
      categories: "خدمات برای",
      neshan: "مسیریابی با نشان",
      balad: "مسیریابی با بلد",
      call: "تماس با {name}",
    },
    empty: {
      title: "با این فیلتر مرکزی پیدا نشد",
      description:
        "استان یا نوع دیگری را انتخاب کن، یا با پشتیبانی تماس بگیر تا نزدیک‌ترین سرویس‌کار مجاز را معرفی کنیم.",
      action: "همه مراکز",
    },
    dealer: {
      eyebrow: "همکاری با ماندگار",
      title: "نمایندگی ماندگار شو",
      body: "اگر فروشگاه یا تعمیرگاه لوازم خانگی داری، به شبکه فروش و خدمات ماندگار بپیوند.",
      points: [
        "آموزش فنی و گواهی سرویس‌کار مجاز",
        "تأمین مستقیم قطعه اصلی از کارخانه",
        "معرفی مشتری از طریق همین صفحه",
      ],
      cta: "درخواست همکاری",
    },
  },
  en: {
    meta: {
      title: "Dealers and service centres",
      description:
        "Addresses, phone numbers and opening hours of authorized Mandegar dealers and service centres across Iran, with directions in Neshan and Balad.",
    },
    hero: {
      eyebrow: "Mandegar across Iran",
      title: "Dealers and service centres",
      description:
        "Find the nearest authorized Mandegar dealer or service centre in your province, with opening hours, phone numbers and directions.",
    },
    filters: {
      label: "Filter centres",
      province: "Province",
      allProvinces: "All provinces",
      kind: "Centre type",
      kinds: { all: "All", dealer: "Sales", service: "Service" },
    },
    kindBadge: { dealer: "Dealer", service: "Service centre", both: "Sales and service" },
    summary: {
      title: "Centres by province",
      results: { one: "{count} centre", other: "{count} centres" },
    },
    card: {
      hours: "Opening hours",
      phones: "Phone",
      categories: "Services for",
      neshan: "Directions in Neshan",
      balad: "Directions in Balad",
      call: "Call {name}",
    },
    empty: {
      title: "No centres match this filter",
      description:
        "Choose another province or type, or call support and we'll point you to the nearest authorized technician.",
      action: "All centres",
    },
    dealer: {
      eyebrow: "Partner with Mandegar",
      title: "Become a Mandegar dealer",
      body: "Run an appliance store or repair shop? Join the Mandegar sales and service network.",
      points: [
        "Technical training and authorized-technician certification",
        "Genuine parts straight from the factory",
        "Customer referrals through this page",
      ],
      cta: "Apply to partner",
    },
  },
};
