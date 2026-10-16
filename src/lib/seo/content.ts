import type { Locale } from "@/i18n/config";
import type { PluralForms } from "@/i18n/plural";

interface SeoContent {
  homeKicker: string;
  warrantyName: string;
  monthUnit: string;
  warrantyMonths: string;
  models: PluralForms;
  steps: PluralForms;
  minutes: string;
  readingMinutes: string;
  productAnswer: string;
  productAnswerFact: string;
  listJoin: string;
  listLast: string;
  chooseQuestion: string;
  chooseAnswer: string;
  chooseFact: string;
  rangeQuestion: string;
  rangeAnswer: string;
  warrantySame: string;
  warrantyRange: string;
  afterSales: { name: string; description: string; serviceType: string };
  warrantyServiceType: string;
}

export const seoContent: Record<Locale, SeoContent> = {
  fa: {
    homeKicker: "لوازم خانگی بادوام، ساخت ایران",
    warrantyName: "گارانتی",
    monthUnit: "ماه",
    warrantyMonths: "گارانتی {count} ماهه",
    models: { one: "{count} مدل", other: "{count} مدل" },
    steps: { one: "{count} مرحله", other: "{count} مرحله" },
    minutes: "{count} دقیقه",
    readingMinutes: "{count} دقیقه مطالعه",
    productAnswer:
      "{name} مدلی از {brand} در دسته {category} است و {months} ماه گارانتی رسمی دارد.",
    productAnswerFact:
      "{name} مدلی از {brand} در دسته {category} با {fact} است و {months} ماه گارانتی رسمی دارد.",
    listJoin: "، ",
    listLast: " و ",
    chooseQuestion: "چطور از میان مدل‌های {category} انتخاب کنم؟",
    chooseAnswer: "{label} مدل‌ها را با نیاز خود مقایسه کنید: {facts}.",
    chooseFact: "{model} با {value}",
    rangeQuestion: "چه مدل‌هایی در دسته {category} وجود دارد؟",
    rangeAnswer: "{count} مدل: {models}. {warranty}",
    warrantySame: "همه این مدل‌ها {months} ماه گارانتی رسمی دارند.",
    warrantyRange: "گارانتی رسمی این مدل‌ها از {min} تا {max} ماه است.",
    afterSales: {
      name: "خدمات پس از فروش ماندگار",
      description:
        "تعمیر، کمک در نصب، قطعات یدکی و مشاوره فنی برای محصولات ماندگار و برندهای همکار در سراسر ایران.",
      serviceType: "خدمات پس از فروش و گارانتی",
    },
    warrantyServiceType: "استعلام اصالت و پوشش گارانتی",
  },
  en: {
    homeKicker: "Durable home appliances, made in Iran",
    warrantyName: "Warranty",
    monthUnit: "months",
    warrantyMonths: "{count}-month warranty",
    models: { one: "{count} model", other: "{count} models" },
    steps: { one: "{count} step", other: "{count} steps" },
    minutes: "{count} min",
    readingMinutes: "{count} min read",
    productAnswer:
      "{name} is a {brand} model in the {category} category, with an official {months}-month warranty.",
    productAnswerFact:
      "{name} is a {brand} model in the {category} category, with {fact} and an official {months}-month warranty.",
    listJoin: ", ",
    listLast: " and ",
    chooseQuestion: "How do I choose between these {category}?",
    chooseAnswer: "Compare the {label} of each model with your needs: {facts}.",
    chooseFact: "{model}: {value}",
    rangeQuestion: "Which {category} are available?",
    rangeAnswer: "{count} models: {models}. {warranty}",
    warrantySame: "All of them carry an official {months}-month warranty.",
    warrantyRange: "Their official warranty runs from {min} to {max} months.",
    afterSales: {
      name: "Mandegar after-sales service",
      description:
        "Repairs, installation help, spare parts and technical advice for Mandegar and partner-brand products across Iran.",
      serviceType: "After-sales and warranty service",
    },
    warrantyServiceType: "Warranty verification and coverage check",
  },
};
