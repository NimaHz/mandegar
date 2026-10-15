import type { Locale } from "@/i18n/config";

interface SeoContent {
  homeKicker: string;
  warrantyName: string;
  monthUnit: string;
  warrantyMonths: string;
  models: string;
  steps: string;
  minutes: string;
  readingMinutes: string;
  productAnswer: string;
  productAnswerFacts: string;
  listJoin: string;
  listLast: string;
  chooseQuestion: string;
  chooseAnswer: string;
  rangeQuestion: string;
  rangeAnswer: string;
  warrantySame: string;
  warrantyRange: string;
}

export const seoContent: Record<Locale, SeoContent> = {
  fa: {
    homeKicker: "لوازم خانگی بادوام، ساخت ایران",
    warrantyName: "گارانتی",
    monthUnit: "ماه",
    warrantyMonths: "گارانتی {count} ماهه",
    models: "{count} مدل",
    steps: "{count} مرحله",
    minutes: "{count} دقیقه",
    readingMinutes: "{count} دقیقه مطالعه",
    productAnswer:
      "{name} مدلی از {brand} در دسته {category} است و {months} ماه گارانتی رسمی دارد.",
    productAnswerFacts: "مشخصات کلیدی: {facts}.",
    listJoin: "، ",
    listLast: " و ",
    chooseQuestion: "چطور از میان مدل‌های {category} انتخاب کنم؟",
    chooseAnswer: "{label} مدل‌ها را با نیاز خود مقایسه کنید: {facts}.",
    rangeQuestion: "چه مدل‌هایی در دسته {category} وجود دارد؟",
    rangeAnswer: "{count} مدل: {models}. {warranty}",
    warrantySame: "همه این مدل‌ها {months} ماه گارانتی رسمی دارند.",
    warrantyRange: "گارانتی رسمی این مدل‌ها از {min} تا {max} ماه است.",
  },
  en: {
    homeKicker: "Durable home appliances, made in Iran",
    warrantyName: "Warranty",
    monthUnit: "months",
    warrantyMonths: "{count}-month warranty",
    models: "{count} models",
    steps: "{count} steps",
    minutes: "{count} min",
    readingMinutes: "{count} min read",
    productAnswer:
      "{name} is a {brand} model in the {category} category with an official {months}-month warranty.",
    productAnswerFacts: "Key figures: {facts}.",
    listJoin: ", ",
    listLast: " and ",
    chooseQuestion: "How do I choose a model in {category}?",
    chooseAnswer: "Compare the {label} of each model with your needs: {facts}.",
    rangeQuestion: "Which models are in {category}?",
    rangeAnswer: "{count} models: {models}. {warranty}",
    warrantySame: "All of them carry an official {months}-month warranty.",
    warrantyRange: "Their official warranty runs from {min} to {max} months.",
  },
};
