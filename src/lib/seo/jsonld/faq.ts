import { type Locale, localeMeta } from "@/i18n/config";

import { plainText } from "../text";
import { nodeId, ref, webPageId } from "./ids";
import type { JsonLdNode } from "./types";

export interface QuestionEntry {
  question: string;
  answer: string;
}

export const questionNodes = (entries: QuestionEntry[]): JsonLdNode[] =>
  entries.map((entry) => ({
    "@type": "Question",
    name: plainText(entry.question),
    acceptedAnswer: { "@type": "Answer", text: plainText(entry.answer) },
  }));

export const faqSectionNode = (
  locale: Locale,
  url: string,
  name: string,
  entries: QuestionEntry[],
): JsonLdNode | null =>
  entries.length === 0
    ? null
    : {
        "@type": "FAQPage",
        "@id": nodeId(url, "faq"),
        url,
        name,
        inLanguage: localeMeta[locale].hreflang,
        isPartOf: ref(webPageId(url)),
        mainEntity: questionNodes(entries),
      };
