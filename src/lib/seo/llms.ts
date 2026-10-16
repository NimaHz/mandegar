import "server-only";

import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { pluralize } from "@/i18n/plural";
import { routes } from "@/lib/routes";
import type { ProductDetail } from "@/types/catalog";

import { feedPath } from "./feed";
import { llmsContent as copy, type LlmsPageKey } from "./llms-content";
import type { LocaleSnapshot, SiteSnapshot } from "./snapshot";
import { plainText } from "./text";
import { absoluteUrl, localeUrl } from "./urls";

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
  const pageLine = (key: LlmsPageKey, path: string, value = 0) =>
    `- ${pair(path, { en: copy.en.pages[key].label, fa: copy.fa.pages[key].label })}: ${count(copy.en.pages[key].note, value)}`;

  const productLines = en.categories.flatMap((category) => {
    const faCategory = findFa(fa.categories, category.slug);
    const models = en.products.filter((product) => product.category.slug === category.slug);
    return [
      `- ${pair(routes.category(category.slug), { en: category.name, fa: faCategory?.name ?? category.name })}: ${pluralize("en", models.length, copy.en.models)}. ${category.summary}`,
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
    fill(copy.en.fullFacts, { url: absoluteUrl("/llms-full.txt") }),
    ...(fa.settings.features.blog
      ? [fill(copy.en.feeds, { fa: absoluteUrl(feedPath("fa")), en: absoluteUrl(feedPath("en")) })]
      : []),
    "",
    `## ${copy.en.sections.products} · ${copy.fa.sections.products}`,
    "",
    `- ${pair(routes.products, { en: copy.en.allProducts, fa: copy.fa.allProducts })}: ${pluralize("en", en.products.length, copy.en.models)}.`,
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
    `- ${pair(routes.guides, { en: copy.en.allGuides, fa: copy.fa.allGuides })}`,
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
    ...(fa.settings.features.blog ? [pageLine("blog", routes.blog)] : []),
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
