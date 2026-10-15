import { Marked, type Tokens } from "marked";

import { cn } from "@/lib/cn";

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

export const headingId = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s‌]+/g, "-")
    .slice(0, 80);

const parser = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
    heading({ tokens, depth, text }: Tokens.Heading) {
      const level = Math.min(Math.max(depth, 2), 4);
      return `<h${level} id="${escapeHtml(headingId(text))}">${this.parser.parseInline(tokens)}</h${level}>`;
    },
    link({ href, title, tokens }: Tokens.Link) {
      const body = this.parser.parseInline(tokens);
      if (!SAFE_URL.test(href)) return body;
      const external = /^https?:/i.test(href);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      const relAttr = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${escapeHtml(href)}"${titleAttr}${relAttr}>${body}</a>`;
    },
    image({ href, title, text }: Tokens.Image) {
      if (!SAFE_URL.test(href)) return escapeHtml(text);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${titleAttr} loading="lazy" decoding="async">`;
    },
    table(token: Tokens.Table) {
      const head = token.header
        .map((cell) => `<th scope="col">${this.parser.parseInline(cell.tokens)}</th>`)
        .join("");
      const body = token.rows
        .map((row) => `<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join("")}</tr>`)
        .join("");
      return `<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
    },
  },
});

export const renderMarkdown = (source: string) => parser.parse(source, { async: false });

export const extractHeadings = (source: string) =>
  parser
    .lexer(source)
    .filter((token): token is Tokens.Heading => token.type === "heading" && token.depth <= 3)
    .map((token) => ({ id: headingId(token.text), text: token.text, depth: token.depth }));

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
