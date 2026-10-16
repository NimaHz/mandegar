import "server-only";

import { type Locale, localeMeta, locales } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { pluralize } from "@/i18n/plural";
import { durationMinutes, formatClock, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { api } from "@/services";
import type { CategoryDetail, ProductDetail, ProductListItem } from "@/types/catalog";
import { type Faq, faqGroups, type GuideDetail, type PostDetail } from "@/types/content";
import type { WarrantyPolicySummary } from "@/types/warranty";

import { categoryFaqs, productAnswer } from "./answers";
import type { QuestionEntry } from "./jsonld/faq";
import { llmsContent } from "./llms-content";
import { type MarkdownPage, markdownPath } from "./markdown-paths";
import { tehranIso } from "./text";
import { absoluteUrl, localeUrl, siteUrl } from "./urls";

type Block = string | false | null | undefined;

const RELATED_LIMIT = 8;
const HEADING = /^(#{1,6})(?=[ \t])/gm;
const ROOT_LINK = /(\]\()\/(?![/\\])/g;
/** Escapes in front of plain punctuation, which the generated category answers carry. */
const PUNCTUATION_ESCAPE = /\\([.,:;?!،؛'"=%&@/])/g;

const inline = (text: string) => text.replace(/\s+/g, " ").trim();

const cell = (text: string) => inline(text).replaceAll("|", "\\|");

const link = (label: string, url: string) => `[${inline(label).replaceAll(/[[\]]/g, "")}](${url})`;

const pageLink = (locale: Locale, label: string, path: string) =>
  link(label, localeUrl(locale, path));

const blocks = (...items: Block[]) => items.filter((item): item is string => Boolean(item));

const section = (title: string, ...items: Block[]) => {
  const body = blocks(...items);
  return body.length > 0 ? [`## ${title}`, ...body].join("\n\n") : null;
};

const list = (items: Block[]) => {
  const lines = blocks(...items);
  return lines.length > 0 ? lines.map((line) => `- ${line}`).join("\n") : null;
};

const facts = (entries: [string, Block][]) =>
  list(entries.map(([label, value]) => value && `**${label}:** ${value}`));

/** Shifts editor Markdown so its top heading sits at `depth`, below the page's own sections. */
const nest = (markdown: string, depth: number) => {
  const levels = [...markdown.matchAll(HEADING)].map((match) => match[1]?.length ?? depth);
  const shift = levels.length > 0 ? Math.max(0, depth - Math.min(...levels)) : 0;
  return markdown
    .replace(HEADING, (hashes) => "#".repeat(Math.min(6, hashes.length + shift)))
    .replace(ROOT_LINK, `$1${siteUrl}/`)
    .trim();
};

const questions = (entries: QuestionEntry[]) =>
  entries
    .map(
      (entry) =>
        `### ${inline(entry.question)}\n\n${nest(entry.answer.replace(PUNCTUATION_ESCAPE, "$1"), 4)}`,
    )
    .join("\n\n");

const date = (value: string | null | undefined) => (value ? tehranIso(value) : null);

const modelName = (product: { name: string; modelCode: string }) =>
  product.name.includes(product.modelCode)
    ? product.name
    : `${product.name} (${product.modelCode})`;

const modelLink = (locale: Locale, product: { slug: string; name: string; modelCode: string }) =>
  pageLink(locale, modelName(product), routes.product(product.slug));

const productLine = (locale: Locale, product: ProductListItem) =>
  `${modelLink(locale, product)}: ${inline(product.tagline)}`;

const months = (locale: Locale, count: number) =>
  fill(llmsContent[locale].markdown.months, { count: formatNumber(locale, count) });

const withoutLead = (description: string, summary: string) => {
  const trimmed = description.trim();
  const lead = summary.trim();
  return lead && trimmed.startsWith(lead) ? trimmed.slice(lead.length).trim() : trimmed;
};

interface DocumentInput {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  updatedAt?: string | null;
  body: Block[];
}

const document = ({ locale, path, title, description, updatedAt, body }: DocumentInput) => {
  const url = localeUrl(locale, path);
  const summary = inline(description);
  const updated = date(updatedAt);
  const header = [
    "---",
    `title: ${JSON.stringify(inline(title))}`,
    ...(summary ? [`description: ${JSON.stringify(summary)}`] : []),
    `url: ${JSON.stringify(url)}`,
    `language: ${localeMeta[locale].hreflang}`,
    ...(updated ? [`updated: ${JSON.stringify(updated)}`] : []),
    "languages:",
    ...locales.map(
      (other) =>
        `  ${localeMeta[other].hreflang}: ${JSON.stringify(absoluteUrl(markdownPath(other, path) ?? path))}`,
    ),
    "---",
  ].join("\n");
  return `${blocks(
    header,
    `# ${inline(title)}`,
    summary && `> ${summary}`,
    `_${fill(llmsContent[locale].markdown.source, { url })}_`,
    ...body,
  ).join("\n\n")}\n`;
};

interface ProductData {
  product: ProductDetail;
  guide: GuideDetail | null;
  policy: WarrantyPolicySummary | null;
  related: ProductListItem[];
}

export const productMarkdown = (locale: Locale, data: ProductData) => {
  const { product, guide, policy, related } = data;
  const { full, markdown: text } = llmsContent[locale];
  const warranty = months(locale, product.warrantyMonths);
  return document({
    locale,
    path: routes.product(product.slug),
    title: modelName(product),
    description: product.tagline,
    updatedAt: product.updatedAt,
    body: [
      productAnswer(locale, product),
      facts([
        [full.modelCode, product.modelCode],
        [
          full.category,
          pageLink(locale, product.category.name, routes.category(product.category.slug)),
        ],
        [full.brand, pageLink(locale, product.brand.name, routes.brand(product.brand.slug))],
        [full.warranty, warranty],
        [
          text.releaseYear,
          product.releaseYear !== null &&
            formatNumber(locale, product.releaseYear, { useGrouping: false }),
        ],
        [text.energyClass, product.energyClass],
      ]),
      product.keyFacts.length > 0 &&
        section(
          full.keyFacts,
          list(product.keyFacts.map((fact) => `**${fact.label}:** ${fact.value}`)),
        ),
      section(
        text.overview,
        product.summary,
        nest(withoutLead(product.description, product.summary), 3),
      ),
      section(
        full.specs,
        ...product.specs.map((group) =>
          [
            `### ${inline(group.title)}`,
            "",
            `| ${cell(text.specLabel)} | ${cell(text.specValue)} |`,
            "| --- | --- |",
            ...group.items.map(
              (item) =>
                `| ${cell(item.label)} | ${cell(item.unit ? `${item.value} ${item.unit}` : item.value)} |`,
            ),
          ].join("\n"),
        ),
      ),
      section(
        text.features,
        ...product.features.map(
          (feature) => `### ${inline(feature.title)}\n\n${nest(feature.body, 4)}`,
        ),
      ),
      guide &&
        section(
          text.installation,
          `${pageLink(locale, guide.title, routes.guide(guide.slug))}: ${inline(guide.summary)}`,
          guide.steps.map((step, index) => `${index + 1}. ${inline(step.title)}`).join("\n"),
        ),
      section(
        text.downloads,
        list(
          product.downloads.map((download) =>
            link(download.title, absoluteUrl(download.file.href)),
          ),
        ),
      ),
      section(
        full.warranty,
        warranty,
        policy && `**${full.startRule}:** ${inline(policy.startRule)}`,
        policy &&
          policy.coverage.length > 0 &&
          `**${full.coverage}:**\n\n${list(policy.coverage.map(inline))}`,
        policy &&
          policy.exclusions.length > 0 &&
          `**${full.exclusions}:**\n\n${list(policy.exclusions.map(inline))}`,
        pageLink(locale, text.warrantyCheck, routes.warranty),
      ),
      product.faqs.length > 0 && section(full.faq, questions(product.faqs)),
      section(text.related, list(related.map((item) => productLine(locale, item)))),
    ],
  });
};

interface CategoryData {
  category: CategoryDetail;
  products: ProductListItem[];
  guide: { slug: string; title: string; summary: string } | null;
  faqs: QuestionEntry[];
}

export const categoryMarkdown = (locale: Locale, data: CategoryData) => {
  const { category, products, guide, faqs } = data;
  const { full, markdown: text, models } = llmsContent[locale];
  return document({
    locale,
    path: routes.category(category.slug),
    title: category.name,
    description: category.summary,
    updatedAt: category.updatedAt,
    body: [
      category.description && nest(category.description, 2),
      section(
        text.subcategories,
        list(
          category.children.map(
            (child) =>
              `${pageLink(locale, child.name, routes.category(child.slug))}: ${inline(child.summary)}`,
          ),
        ),
      ),
      section(
        fill(text.categoryModels, { name: category.name }),
        pluralize(locale, products.length, models),
        list(
          products.map(
            (product) =>
              `${productLine(locale, product)} (${full.warranty}: ${months(locale, product.warrantyMonths)})`,
          ),
        ),
      ),
      guide &&
        section(
          text.installation,
          `${pageLink(locale, guide.title, routes.guide(guide.slug))}: ${inline(guide.summary)}`,
        ),
      faqs.length > 0 &&
        section(full.faq, questions(faqs), pageLink(locale, text.allFaqs, routes.faq)),
    ],
  });
};

const videoUrl = (guide: GuideDetail) => {
  if (!guide.video) return null;
  return guide.video.kind === "upload"
    ? absoluteUrl(guide.video.src)
    : `https://www.aparat.com/v/${guide.video.hash}`;
};

export const guideMarkdown = (locale: Locale, guide: GuideDetail) => {
  const { markdown: text } = llmsContent[locale];
  const video = videoUrl(guide);
  return document({
    locale,
    path: routes.guide(guide.slug),
    title: guide.title,
    description: guide.summary,
    updatedAt: guide.updatedAt,
    body: [
      facts([
        [
          llmsContent[locale].full.category,
          guide.categories
            .map((category) => pageLink(locale, category.name, routes.category(category.slug)))
            .join(", "),
        ],
        [
          text.video,
          video &&
            `${link(guide.title, video)}${guide.durationSec !== null ? ` (${fill(text.duration, { count: formatNumber(locale, durationMinutes(guide.durationSec)) })})` : ""}`,
        ],
        [text.published, date(guide.publishedAt)],
      ]),
      section(
        text.chapters,
        list(
          guide.chapters.map(
            (chapter) => `${formatClock("en", chapter.startSec)} ${inline(chapter.title)}`,
          ),
        ),
      ),
      section(text.tools, list(guide.tools.map(inline))),
      section(text.safety, list(guide.safety.map(inline))),
      section(
        text.steps,
        ...guide.steps.map((step, index) =>
          blocks(
            `### ${fill(text.step, { count: index + 1 })}: ${inline(step.title)}`,
            nest(step.body, 4),
            step.image && `![${inline(step.image.alt)}](${absoluteUrl(step.image.src)})`,
          ).join("\n\n"),
        ),
      ),
      section(text.guideModels, list(guide.products.map((product) => modelLink(locale, product)))),
    ],
  });
};

export const postMarkdown = (locale: Locale, post: PostDetail) => {
  const { markdown: text } = llmsContent[locale];
  return document({
    locale,
    path: routes.post(post.slug),
    title: post.title,
    description: post.excerpt,
    updatedAt: post.updatedAt,
    body: [
      facts([
        [text.author, pageLink(locale, post.author.name, routes.author(post.author.slug))],
        [text.published, date(post.publishedAt)],
      ]),
      post.cover && `![${inline(post.cover.alt)}](${absoluteUrl(post.cover.src)})`,
      nest(post.body, 2),
      section(
        text.postProducts,
        list(post.relatedProducts.map((product) => modelLink(locale, product))),
      ),
    ],
  });
};

export const faqMarkdown = (locale: Locale, faqs: Faq[]) => {
  const { markdown: text, pages } = llmsContent[locale];
  return document({
    locale,
    path: routes.faq,
    title: pages.faq.label,
    description: pages.faq.note,
    updatedAt: faqs.reduce<string | null>(
      (latest, faq) => (!latest || faq.updatedAt > latest ? faq.updatedAt : latest),
      null,
    ),
    body: faqGroups.map((group) =>
      section(text.faqGroups[group], questions(faqs.filter((faq) => faq.group === group))),
    ),
  });
};

const loadProduct = async (locale: Locale, slug: string) => {
  const product = await api.catalog.product(locale, slug);
  if (!product) return null;
  const [guide, policies, related] = await Promise.all([
    product.guideSlug ? api.content.guide(locale, product.guideSlug) : Promise.resolve(null),
    api.warranty.policies(locale),
    api.catalog.related(locale, product.slug, RELATED_LIMIT),
  ]);
  const policy = policies.find((item) => item.months === product.warrantyMonths) ?? null;
  return productMarkdown(locale, { product, guide, policy, related });
};

const loadCategory = async (locale: Locale, slug: string) => {
  const category = await api.catalog.category(locale, slug);
  if (!category) return null;
  const [products, insights, guides, generalFaqs] = await Promise.all([
    api.catalog.byCategory(locale, category.slug),
    api.catalog.categoryInsights(locale, category.slug),
    api.content.guides(locale),
    api.content.faqs(locale, "general"),
  ]);
  const guide =
    guides.find((entry) => entry.categories.some((item) => item.slug === category.slug)) ?? null;
  const faqs = categoryFaqs(locale, category.name, insights, generalFaqs);
  return categoryMarkdown(locale, { category, products, guide, faqs });
};

const loadPost = async (locale: Locale, slug: string) => {
  const [settings, post] = await Promise.all([
    api.content.settings(locale),
    api.content.post(locale, slug),
  ]);
  return settings.features.blog && post ? postMarkdown(locale, post) : null;
};

/** The Markdown copy of a public page, or null when the page does not exist. */
export const pageMarkdown = async (locale: Locale, page: MarkdownPage) => {
  switch (page.kind) {
    case "product":
      return loadProduct(locale, page.slug);
    case "category":
      return loadCategory(locale, page.slug);
    case "guide": {
      const guide = await api.content.guide(locale, page.slug);
      return guide ? guideMarkdown(locale, guide) : null;
    }
    case "post":
      return loadPost(locale, page.slug);
    case "faq":
      return faqMarkdown(locale, await api.content.faqs(locale));
  }
};

export const markdownResponse = (locale: Locale, path: string, body: string) =>
  new Response(body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Language": localeMeta[locale].hreflang,
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex",
      Link: `<${localeUrl(locale, path)}>; rel="canonical"`,
      Vary: "Accept",
    },
  });
