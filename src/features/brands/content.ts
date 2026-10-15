import type { PluralForms } from "@/features/catalog/plural";
import type { Locale } from "@/i18n/config";

export interface BrandsContent {
  listing: {
    eyebrow: string;
    title: string;
    titleHighlight: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    own: string;
    ownLead: string;
    partnersTitle: string;
    partnersDescription: string;
    partner: string;
    models: PluralForms;
    viewModels: string;
    promise: string[];
  };
  detail: {
    metaTitle: string;
    own: string;
    partner: string;
    models: PluralForms;
    website: string;
    productsTitle: string;
    productsDescription: string;
    partnerNote: string;
    emptyTitle: string;
    emptyDescription: string;
    emptyAction: string;
  };
}

export const brandsContent: Record<Locale, BrandsContent> = {
  fa: {
    listing: {
      eyebrow: "برندها",
      title: "یک گارانتی، یک شبکه خدمات،",
      titleHighlight: "چند برند معتبر",
      description:
        "محصولات ماندگار را خودمان طراحی و تولید می‌کنیم و برندهای همکار را با همان گارانتی و خدمات پس از فروش عرضه می‌کنیم.",
      metaTitle: "برندها",
      metaDescription:
        "ماندگار و برندهای همکار؛ همه با گارانتی رسمی، راهنمای نصب و خدمات پس از فروش ماندگار در سراسر ایران.",
      own: "برند ماندگار",
      ownLead: "طراحی و ساخت در ایران",
      partnersTitle: "برندهای همکار",
      partnersDescription: "گزیده‌ای از برندهایی که با استانداردهای ما همخوانی دارند.",
      partner: "برند همکار",
      models: { one: "{count} مدل", other: "{count} مدل" },
      viewModels: "دیدن مدل‌ها",
      promise: ["گارانتی رسمی ماندگار", "قطعه اصلی و سرویس‌کار مجاز", "راهنمای نصب برای هر مدل"],
    },
    detail: {
      metaTitle: "{name}: مدل‌ها، گارانتی و خدمات",
      own: "برند ماندگار",
      partner: "برند همکار",
      models: { one: "{count} مدل", other: "{count} مدل" },
      website: "وب‌سایت برند",
      productsTitle: "مدل‌های {name}",
      productsDescription: "همه مدل‌های این برند با مشخصات کامل و گارانتی رسمی ماندگار.",
      partnerNote: "گارانتی و خدمات پس از فروش این برند را ماندگار ارائه می‌کند.",
      emptyTitle: "هنوز مدلی از این برند منتشر نشده",
      emptyDescription: "به‌زودی مدل‌های این برند اضافه می‌شوند. تا آن زمان سایر محصولات را ببین.",
      emptyAction: "همه محصولات",
    },
  },
  en: {
    listing: {
      eyebrow: "Brands",
      title: "One warranty, one service network,",
      titleHighlight: "trusted brands",
      description:
        "We design and build Mandegar products ourselves, and offer partner brands with the same warranty and after-sales service.",
      metaTitle: "Brands",
      metaDescription:
        "Mandegar and partner brands, all with an official warranty, installation guides and Mandegar after-sales service across Iran.",
      own: "Mandegar brand",
      ownLead: "Designed and built in Iran",
      partnersTitle: "Partner brands",
      partnersDescription: "A curated set of brands that meet our standards.",
      partner: "Partner brand",
      models: { one: "{count} model", other: "{count} models" },
      viewModels: "View models",
      promise: [
        "Official Mandegar warranty",
        "Genuine parts, authorized technicians",
        "An installation guide for every model",
      ],
    },
    detail: {
      metaTitle: "{name}: models, warranty and service",
      own: "Mandegar brand",
      partner: "Partner brand",
      models: { one: "{count} model", other: "{count} models" },
      website: "Brand website",
      productsTitle: "{name} models",
      productsDescription:
        "Every model from this brand, with full specs and an official Mandegar warranty.",
      partnerNote: "Warranty and after-sales service for this brand are provided by Mandegar.",
      emptyTitle: "No models from this brand yet",
      emptyDescription:
        "Models from this brand are coming soon. Meanwhile, explore our other products.",
      emptyAction: "All products",
    },
  },
};
