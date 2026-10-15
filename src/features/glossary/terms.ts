import { type Locale, localeMeta } from "@/i18n/config";

import { type GlossarySlug, glossarySlugs } from "./config";
import { glossaryContent } from "./content";

export interface GlossaryTermEntry {
  slug: GlossarySlug;
  term: string;
  definition: string;
}

export interface GlossaryLetter {
  letter: string;
  label: string;
  anchor: string;
  terms: GlossaryTermEntry[];
}

const initialOf = (term: string) => {
  const first = term.trim().charAt(0).toLocaleUpperCase();
  return first === "آ" ? "ا" : first;
};

export const glossaryLetters = (locale: Locale): GlossaryLetter[] => {
  const { alphabet, terms } = glossaryContent[locale];
  const collator = new Intl.Collator(localeMeta[locale].intl);
  const sorted = glossarySlugs
    .map((slug) => ({ slug, ...terms[slug] }))
    .toSorted((left, right) => collator.compare(left.term, right.term));

  return alphabet.map((letter, index) => ({
    letter,
    label: letter === "ه" ? "هـ" : letter,
    anchor: `letter-${index + 1}`,
    terms: sorted.filter((entry) => initialOf(entry.term) === letter),
  }));
};
