import "server-only";

import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { routes } from "@/lib/routes";
import type { ProductDetail } from "@/types/catalog";

import type { LocaleSnapshot, SiteSnapshot } from "./snapshot";
import { plainText } from "./text";
import { absoluteUrl, localeUrl } from "./urls";

type PageKey =
  | "warranty"
  | "serviceRequest"
  | "track"
  | "serviceCenters"
  | "faq"
  | "support"
  | "about"
  | "contact"
  | "brands"
  | "glossary"
  | "blog";

interface LlmsCopy {
  name: string;
  summary: string;
  languages: string;
  sections: { products: string; support: string; guides: string; company: string };
  models: string;
  warrantyMonths: string;
  pages: Record<PageKey, { label: string; note: string }>;
  full: {
    title: string;
    catalog: string;
    supportTitle: string;
    url: string;
    modelCode: string;
    category: string;
    brand: string;
    summary: string;
    keyFacts: string;
    specs: string;
    warranty: string;
    guide: string;
    faq: string;
    warrantyCodes: string;
    serviceRequest: string;
    hours: string;
    phones: string;
    emails: string;
    address: string;
    policies: string;
    coverage: string;
    exclusions: string;
    startRule: string;
    centers: string;
  };
}

const copy: Record<Locale, LlmsCopy> = {
  en: {
    name: "Mandegar",
    summary:
      "Mandegar is an Iranian maker of durable home appliances: evaporative coolers, gas and electric heaters, water heaters, kitchen appliances and fans. Every model comes with an official warranty, installation guides and nationwide after-sales service. The website is a catalog: it has no prices, cart or checkout.",
    languages: "Persian is the default language at {fa}. English pages live under {en}.",
    sections: {
      products: "Products by category",
      support: "Support and warranty",
      guides: "Guides",
      company: "Company",
    },
    models: "{count} models",
    warrantyMonths: "{count}-month warranty",
    pages: {
      warranty: {
        label: "Warranty check",
        note: "Enter the code printed on the product label or warranty card to see the model, production year and warranty coverage.",
      },
      serviceRequest: {
        label: "Request service",
        note: "Book a repair, installation help, spare parts or technical advice; you get a tracking code.",
      },
      track: {
        label: "Track a request",
        note: "Check a service request with its tracking code and phone number.",
      },
      serviceCenters: {
        label: "Dealers and service centres",
        note: "{count} authorised dealers and service centres with address, phone and opening hours.",
      },
      faq: { label: "FAQ", note: "Answers about products, warranty, installation and service." },
      support: { label: "After-sales service", note: "Every support option in one place." },
      about: { label: "About Mandegar", note: "Company history, factory and values." },
      contact: { label: "Contact", note: "Phone numbers, email addresses, address and hours." },
      brands: {
        label: "Brands",
        note: "Mandegar and the partner brands it distributes and services.",
      },
      glossary: { label: "Glossary", note: "Plain definitions of appliance terms." },
      blog: { label: "Mandegar Journal", note: "News, buying advice and maintenance tips." },
    },
    full: {
      title: "Mandegar: full product and support facts (English)",
      catalog: "Product catalog",
      supportTitle: "Support facts",
      url: "URL",
      modelCode: "Model code",
      category: "Category",
      brand: "Brand",
      summary: "Summary",
      keyFacts: "Key facts",
      specs: "Specifications",
      warranty: "Warranty",
      guide: "Installation guide",
      faq: "Questions and answers",
      warrantyCodes:
        "Warranty codes: every product carries a 9-character warranty code such as W5K-3M9-XTS, printed on the product label and the warranty card. Enter it at {url} to see the model, production year, warranty months, coverage and exclusions. Letters are not case-sensitive and dashes are optional.",
      serviceRequest:
        "Service requests: fill in the form at {url} with your contact details, address, the warranty code if you have one, and a description. You get a tracking code such as T5K3-M9XT and a private link. Track the request at {track}. If you smell gas, close the gas valve, open the windows and call 194.",
      hours: "Hours",
      phones: "Phone",
      emails: "Email",
      address: "Address",
      policies: "Warranty policies",
      coverage: "Covered",
      exclusions: "Not covered",
      startRule: "Warranty starts",
      centers: "Dealers and service centres",
    },
  },
  fa: {
    name: "ماندگار",
    summary:
      "ماندگار تولیدکننده ایرانی لوازم خانگی بادوام است: کولر آبی، بخاری گازی و برقی، آبگرمکن، لوازم آشپزخانه و پنکه. هر مدل گارانتی رسمی، راهنمای نصب و خدمات پس از فروش در سراسر کشور دارد. این سایت کاتالوگ محصولات است و قیمت، سبد خرید یا پرداخت آنلاین ندارد.",
    languages: "زبان پیش‌فرض فارسی است ({fa}) و صفحه‌های انگلیسی زیر {en} قرار دارند.",
    sections: {
      products: "محصولات بر اساس دسته",
      support: "پشتیبانی و گارانتی",
      guides: "راهنماها",
      company: "شرکت",
    },
    models: "{count} مدل",
    warrantyMonths: "گارانتی {count} ماهه",
    pages: {
      warranty: {
        label: "استعلام گارانتی",
        note: "کد چاپ‌شده روی برچسب محصول یا کارت گارانتی را وارد کنید تا مدل، سال تولید و پوشش گارانتی را ببینید.",
      },
      serviceRequest: {
        label: "ثبت درخواست خدمات",
        note: "درخواست تعمیر، کمک در نصب، قطعه یدکی یا مشاوره فنی؛ بعد از ثبت، کد پیگیری می‌گیرید.",
      },
      track: {
        label: "پیگیری درخواست",
        note: "وضعیت درخواست را با کد پیگیری و شماره موبایل ببینید.",
      },
      serviceCenters: {
        label: "نمایندگی‌ها و مراکز خدمات",
        note: "{count} نمایندگی و مرکز خدمات مجاز با نشانی، تلفن و ساعت کاری.",
      },
      faq: {
        label: "پرسش‌های متداول",
        note: "پاسخ پرسش‌های رایج درباره محصولات، گارانتی، نصب و خدمات.",
      },
      support: { label: "خدمات پس از فروش", note: "همه راه‌های پشتیبانی در یک صفحه." },
      about: { label: "درباره ماندگار", note: "تاریخچه، کارخانه و ارزش‌های ماندگار." },
      contact: { label: "تماس با ما", note: "شماره‌ها، ایمیل‌ها، نشانی و ساعت کاری." },
      brands: { label: "برندها", note: "ماندگار و برندهای همکاری که عرضه و پشتیبانی می‌کند." },
      glossary: { label: "واژه‌نامه", note: "تعریف ساده اصطلاحات لوازم خانگی." },
      blog: { label: "مجله ماندگار", note: "خبرها، راهنمای خرید و نکته‌های نگهداری." },
    },
    full: {
      title: "ماندگار: اطلاعات کامل محصولات و پشتیبانی (فارسی)",
      catalog: "کاتالوگ محصولات",
      supportTitle: "اطلاعات پشتیبانی",
      url: "نشانی صفحه",
      modelCode: "کد مدل",
      category: "دسته",
      brand: "برند",
      summary: "خلاصه",
      keyFacts: "ویژگی‌های کلیدی",
      specs: "مشخصات فنی",
      warranty: "گارانتی",
      guide: "راهنمای نصب",
      faq: "پرسش و پاسخ",
      warrantyCodes:
        "کد گارانتی: روی برچسب هر محصول و کارت گارانتی آن یک کد ۹ نویسه‌ای مثل W5K-3M9-XTS چاپ شده است. این کد را در {url} وارد کنید تا مدل، سال تولید، مدت گارانتی، موارد تحت پوشش و استثناها را ببینید. حروف کوچک و بزرگ فرقی ندارند و خط تیره اختیاری است.",
      serviceRequest:
        "درخواست خدمات: فرم {url} را با مشخصات تماس، نشانی، کد گارانتی (اگر دارید) و شرح مشکل پر کنید. یک کد پیگیری مثل T5K3-M9XT و یک لینک خصوصی دریافت می‌کنید. پیگیری درخواست از {track} انجام می‌شود. اگر بوی گاز حس می‌کنید، شیر گاز را ببندید، پنجره‌ها را باز کنید و با ۱۹۴ تماس بگیرید.",
      hours: "ساعت کاری",
      phones: "تلفن",
      emails: "ایمیل",
      address: "نشانی",
      policies: "شرایط گارانتی",
      coverage: "تحت پوشش",
      exclusions: "خارج از پوشش",
      startRule: "شروع گارانتی",
      centers: "نمایندگی‌ها و مراکز خدمات",
    },
  },
};

const LANGUAGE_ORDER: Locale[] = ["en", "fa"];

const link = (label: string, url: string) => `[${label.replaceAll(/[[\]]/g, "")}](${url})`;

const pair = (path: string, labels: Record<Locale, string>) =>
  LANGUAGE_ORDER.map((locale) => link(labels[locale], localeUrl(locale, path))).join(" · ");

const count = (template: string, value: number) => fill(template, { count: value });

const productNote = (product: ProductDetail) =>
  `${product.modelCode} · ${product.category.name} · ${product.brand.name} · ${count(copy.en.warrantyMonths, product.warrantyMonths)}. ${product.tagline}`;

export const llmsText = (snapshot: SiteSnapshot) => {
  const { en, fa } = snapshot;
  const findFa = <TItem extends { slug: string }>(items: TItem[], slug: string) =>
    items.find((item) => item.slug === slug);
  const pageLine = (key: PageKey, path: string, value = 0) =>
    `- ${pair(path, { en: copy.en.pages[key].label, fa: copy.fa.pages[key].label })}: ${count(copy.en.pages[key].note, value)}`;

  const productLines = en.categories.flatMap((category) => {
    const faCategory = findFa(fa.categories, category.slug);
    const models = en.products.filter((product) => product.category.slug === category.slug);
    return [
      `- ${pair(routes.category(category.slug), { en: category.name, fa: faCategory?.name ?? category.name })}: ${count(copy.en.models, models.length)}. ${category.summary}`,
      ...models.map((product) => {
        const faProduct = findFa(fa.products, product.slug);
        return `- ${pair(routes.product(product.slug), { en: product.name, fa: faProduct?.name ?? product.name })}: ${productNote(product)}`;
      }),
    ];
  });

  return [
    `# ${copy.en.name} (${copy.fa.name})`,
    "",
    `> ${copy.en.summary}`,
    "",
    copy.fa.summary,
    "",
    fill(copy.en.languages, { fa: localeUrl("fa", routes.home), en: localeUrl("en", routes.home) }),
    `Full plain-text facts: ${absoluteUrl("/llms-full.txt")}`,
    "",
    `## ${copy.en.sections.products} · ${copy.fa.sections.products}`,
    "",
    `- ${pair(routes.products, { en: "All products", fa: "همه محصولات" })}: ${count(copy.en.models, en.products.length)}.`,
    ...productLines,
    "",
    `## ${copy.en.sections.support} · ${copy.fa.sections.support}`,
    "",
    pageLine("warranty", routes.warranty),
    pageLine("serviceRequest", routes.serviceRequest),
    pageLine("track", routes.track),
    pageLine("serviceCenters", routes.serviceCenters, en.serviceCenters.length),
    pageLine("support", routes.support),
    pageLine("faq", routes.faq),
    "",
    `## ${copy.en.sections.guides} · ${copy.fa.sections.guides}`,
    "",
    `- ${pair(routes.guides, { en: "All guides", fa: "همه راهنماها" })}`,
    ...en.guides.map((guide) => {
      const faGuide = findFa(fa.guides, guide.slug);
      return `- ${pair(routes.guide(guide.slug), { en: guide.title, fa: faGuide?.title ?? guide.title })}: ${guide.summary}`;
    }),
    "",
    `## ${copy.en.sections.company} · ${copy.fa.sections.company}`,
    "",
    pageLine("about", routes.about),
    pageLine("contact", routes.contact),
    pageLine("brands", routes.brands),
    pageLine("glossary", routes.glossary),
    pageLine("blog", routes.blog),
    "",
    "## Optional",
    "",
    ...en.posts.map((post) => {
      const faPost = findFa(fa.posts, post.slug);
      return `- ${pair(routes.post(post.slug), { en: post.title, fa: faPost?.title ?? post.title })}: ${post.excerpt}`;
    }),
    "",
  ].join("\n");
};

const productFacts = (locale: Locale, data: LocaleSnapshot, product: ProductDetail) => {
  const text = copy[locale].full;
  const guide = product.guideSlug
    ? data.guides.find((item) => item.slug === product.guideSlug)
    : undefined;
  return [
    `### ${product.name} (${product.modelCode})`,
    `${text.url}: ${localeUrl(locale, routes.product(product.slug))}`,
    `${text.modelCode}: ${product.modelCode}`,
    `${text.category}: ${product.category.name}`,
    `${text.brand}: ${product.brand.name}`,
    `${text.summary}: ${plainText(product.summary || product.tagline)}`,
    `${text.warranty}: ${count(copy[locale].warrantyMonths, product.warrantyMonths)}`,
    ...(guide
      ? [`${text.guide}: ${guide.title}, ${localeUrl(locale, routes.guide(guide.slug))}`]
      : []),
    ...(product.keyFacts.length > 0
      ? [`${text.keyFacts}:`, ...product.keyFacts.map((fact) => `- ${fact.label}: ${fact.value}`)]
      : []),
    `${text.specs}:`,
    ...product.specs.flatMap((group) =>
      group.items.map(
        (item) =>
          `- ${group.title} / ${item.label}: ${item.value}${item.unit ? ` ${item.unit}` : ""}`,
      ),
    ),
    ...(product.faqs.length > 0
      ? [
          `${text.faq}:`,
          ...product.faqs.flatMap((faq) => [
            `Q: ${plainText(faq.question)}`,
            `A: ${plainText(faq.answer)}`,
          ]),
        ]
      : []),
    "",
  ];
};

const supportFacts = (locale: Locale, data: LocaleSnapshot) => {
  const text = copy[locale].full;
  const { settings } = data;
  return [
    `## ${text.supportTitle}`,
    "",
    fill(text.warrantyCodes, { url: localeUrl(locale, routes.warranty) }),
    "",
    fill(text.serviceRequest, {
      url: localeUrl(locale, routes.serviceRequest),
      track: localeUrl(locale, routes.track),
    }),
    "",
    `${text.hours}: ${settings.hours}`,
    ...settings.phones.map((phone) => `${text.phones} (${phone.label}): ${phone.value}`),
    ...settings.emails.map((email) => `${text.emails} (${email.label}): ${email.value}`),
    `${text.address}: ${settings.address}`,
    "",
    `### ${text.policies}`,
    ...data.policies.flatMap((policy) => [
      `- ${policy.name}: ${count(copy[locale].warrantyMonths, policy.months)}`,
      `  ${text.startRule}: ${policy.startRule}`,
      `  ${text.coverage}: ${policy.coverage.join("; ")}`,
      `  ${text.exclusions}: ${policy.exclusions.join("; ")}`,
    ]),
    "",
    `### ${text.centers}`,
    ...data.serviceCenters.map(
      (center) =>
        `- ${center.name} (${center.provinceName}, ${center.city}): ${center.address}. ${text.phones}: ${center.phones.join(", ")}. ${text.hours}: ${center.hours}`,
    ),
    "",
    `### ${copy[locale].pages.faq.label}`,
    ...data.faqs.flatMap((faq) => [`Q: ${plainText(faq.question)}`, `A: ${plainText(faq.answer)}`]),
    "",
  ];
};

export const llmsFullText = (snapshot: SiteSnapshot) =>
  LANGUAGE_ORDER.flatMap((locale) => {
    const data = snapshot[locale];
    const text = copy[locale];
    return [
      `# ${text.full.title}`,
      "",
      `> ${text.summary}`,
      "",
      `## ${text.full.catalog}`,
      "",
      ...data.products.flatMap((product) => productFacts(locale, data, product)),
      ...supportFacts(locale, data),
    ];
  }).join("\n");

export const textResponse = (body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
