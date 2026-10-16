import { Marked, type Tokens } from "marked";

import { cn } from "@/lib/cn";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const SAFE_URL = /^(https?:|mailto:|tel:|\/(?![/\\])|#)/i;

const URL_NOISE = /[\p{Cc}\s]/u;

const isSafeUrl = (href: string) => SAFE_URL.test(href) && !URL_NOISE.test(href);

const MODEL_CODE = /\b([A-Z]+-\d[\dA-Z]*)\b/g;

const headingSlug = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .slice(0, 80)
    .replace(/^-+|-+$/g, "");

const createSlugger = () => {
  const used = new Set<string>();
  return (text: string) => {
    const base = headingSlug(text) || "section";
    let slug = base;
    for (let count = 2; used.has(slug); count += 1) slug = `${base}-${count}`;
    used.add(slug);
    return slug;
  };
};

let slugHeading = createSlugger();

const parser = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
    text(token: Tokens.Text | Tokens.Escape) {
      if ("tokens" in token && token.tokens) return this.parser.parseInline(token.tokens);
      const text = "escaped" in token && token.escaped ? token.text : escapeHtml(token.text);
      return text.replace(MODEL_CODE, '<bdi dir="ltr" class="whitespace-nowrap">$1</bdi>');
    },
    heading({ tokens, depth, text }: Tokens.Heading) {
      const level = Math.min(Math.max(depth, 2), 4);
      return `<h${level} id="${escapeHtml(slugHeading(text))}">${this.parser.parseInline(tokens)}</h${level}>`;
    },
    link({ href, title, tokens }: Tokens.Link) {
      const body = this.parser.parseInline(tokens);
      if (!isSafeUrl(href)) return body;
      const external = /^https?:/i.test(href);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const relAttr = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${titleAttr}${relAttr}>${body}</a>`;
    },
    image({ href, title, text }: Tokens.Image) {
      if (!isSafeUrl(href)) return escapeHtml(text);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
    },
    table(token: Tokens.Table) {
      const head = token.header
        .map((cell) => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`)
        .join("");
      const body = token.rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`,
        )
        .join("");
      return `<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    },
  },
});

export const renderMarkdown = (source: string) => {
  slugHeading = createSlugger();
  return parser.parse(source, { async: false });
};

export const extractHeadings = (source: string) => {
  const slug = createSlugger();
  const headings: { id: string; text: string; depth: number }[] = [];
  for (const block of parser.lexer(source)) {
    parser.walkTokens([block], (token) => {
      if (token.type !== "heading") return;
      const id = slug(token.text);
      if (token === block && token.depth <= 3) {
        headings.push({ id, text: token.text, depth: token.depth });
      }
    });
  }
  return headings;
};

interface MarkdownProps {
  source: string;
  className?: string;
}

export function Markdown({ source, className }: MarkdownProps) {
  return (
    <div
      className={cn("prose-mandegar", className)}
      dangerouslySetInnerHTML={{ __html: renderMarkdown(source) }}
    />
  );
}
