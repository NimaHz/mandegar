import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import type { KeyFact, ProductDetail } from "@/types/catalog";

import { seoContent } from "./content";
import type { QuestionEntry } from "./jsonld/faq";

const ANSWER_FACTS = 3;

const joinList = (locale: Locale, items: string[]) => {
  const { listJoin, listLast } = seoContent[locale];
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(listJoin)}${listLast}${items.at(-1)}`;
};

const factText = (locale: Locale, fact: KeyFact) =>
  locale === "en" ? `${fact.label.toLowerCase()} ${fact.value}` : `${fact.label} ${fact.value}`;

export const productAnswer = (locale: Locale, product: ProductDetail) => {
  const copy = seoContent[locale];
  const name = product.name.includes(product.modelCode)
    ? product.name
    : `${product.name} (${product.modelCode})`;
  const lead = fill(copy.productAnswer, {
    name,
    brand: product.brand.name,
    category: product.category.name,
    months: formatNumber(locale, product.warrantyMonths),
  });
  const facts = product.keyFacts.slice(0, ANSWER_FACTS).map((fact) => factText(locale, fact));
  return facts.length > 0
    ? `${lead} ${fill(copy.productAnswerFacts, { facts: joinList(locale, facts) })}`
    : lead;
};

const sharedFactLabel = (products: ProductDetail[]) => {
  const [first, ...rest] = products;
  return first?.keyFacts.find((fact) =>
    rest.every((product) => product.keyFacts.some((item) => item.label === fact.label)),
  )?.label;
};

export const categoryChoiceFaqs = (
  locale: Locale,
  categoryName: string,
  products: ProductDetail[],
): QuestionEntry[] => {
  if (products.length < 2) return [];
  const copy = seoContent[locale];
  const months = products.map((product) => product.warrantyMonths);
  const min = Math.min(...months);
  const max = Math.max(...months);
  const warranty =
    min === max
      ? fill(copy.warrantySame, { months: formatNumber(locale, min) })
      : fill(copy.warrantyRange, {
          min: formatNumber(locale, min),
          max: formatNumber(locale, max),
        });
  const label = sharedFactLabel(products);
  const choose: QuestionEntry[] = label
    ? [
        {
          question: fill(copy.chooseQuestion, { category: categoryName }),
          answer: fill(copy.chooseAnswer, {
            label: locale === "en" ? label.toLowerCase() : label,
            facts: joinList(
              locale,
              products.map((product) => {
                const value = product.keyFacts.find((fact) => fact.label === label)?.value ?? "";
                return `${product.modelCode}: ${value}`;
              }),
            ),
          }),
        },
      ]
    : [];
  return [
    ...choose,
    {
      question: fill(copy.rangeQuestion, { category: categoryName }),
      answer: fill(copy.rangeAnswer, {
        count: formatNumber(locale, products.length),
        models: joinList(
          locale,
          products.map((product) => product.name),
        ),
        warranty,
      }),
    },
  ];
};
