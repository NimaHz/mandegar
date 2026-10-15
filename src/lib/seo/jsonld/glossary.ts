import { type Locale, localeMeta } from "@/i18n/config";

import { plainText } from "../text";
import { nodeId, ref } from "./ids";
import type { JsonLdNode } from "./types";

export interface GlossaryEntry {
  term: string;
  definition: string;
  anchor?: string | null;
  alternateName?: string | null;
}

interface GlossaryInput {
  locale: Locale;
  url: string;
  name: string;
  description: string;
  entries: GlossaryEntry[];
}

export const glossaryId = (url: string) => nodeId(url, "glossary");

export const definedTermSetNode = ({
  locale,
  url,
  name,
  description,
  entries,
}: GlossaryInput): JsonLdNode => ({
  "@type": "DefinedTermSet",
  "@id": glossaryId(url),
  name,
  description,
  url,
  inLanguage: localeMeta[locale].hreflang,
  hasDefinedTerm: entries.map((entry) => ({
    "@type": "DefinedTerm",
    "@id": entry.anchor ? nodeId(url, entry.anchor) : null,
    name: entry.term,
    alternateName: entry.alternateName,
    description: plainText(entry.definition),
    url: entry.anchor ? nodeId(url, entry.anchor) : null,
    inDefinedTermSet: ref(glossaryId(url)),
  })),
});
