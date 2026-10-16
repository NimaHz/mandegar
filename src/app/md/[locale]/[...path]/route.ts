import { isLocale } from "@/i18n/config";
import { markdownResponse, pageMarkdown } from "@/lib/seo/markdown";
import { markdownPage } from "@/lib/seo/markdown-paths";

export const revalidate = 3600;

export function generateStaticParams() {
  return [];
}

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex" },
  });

export async function GET(_request: Request, context: RouteContext<"/md/[locale]/[...path]">) {
  const { locale, path: segments } = await context.params;
  const path = `/${segments.join("/")}`;
  const page = markdownPage(path);
  if (!isLocale(locale) || !page) return notFound();
  const body = await pageMarkdown(locale, page);
  return body ? markdownResponse(locale, path, body) : notFound();
}
