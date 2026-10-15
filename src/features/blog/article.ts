import { extractHeadings } from "@/components/shared/markdown";

const OPENING_SECTION = /^##[ \t]+(.+)\r?\n/;
const NEXT_SECTION = /^#{1,2}[ \t]/m;
const INLINE_MARKS = /\[([^\]]*)\]\([^)]*\)|[*_`~]/g;

export interface Takeaways {
  title: string;
  source: string;
}

export const splitTakeaways = (source: string): { takeaways: Takeaways | null; body: string } => {
  const trimmed = source.trimStart();
  const opening = OPENING_SECTION.exec(trimmed);
  if (!opening?.[1]) return { takeaways: null, body: source };
  const rest = trimmed.slice(opening[0].length);
  const next = rest.search(NEXT_SECTION);
  if (next <= 0) return { takeaways: null, body: source };
  const content = rest.slice(0, next).trim();
  if (!content) return { takeaways: null, body: source };
  return { takeaways: { title: opening[1].trim(), source: content }, body: rest.slice(next) };
};

export const tocHeadings = (source: string) =>
  extractHeadings(source).map((heading) => ({
    ...heading,
    text: heading.text.replace(INLINE_MARKS, (_, label?: string) => label ?? ""),
  }));
