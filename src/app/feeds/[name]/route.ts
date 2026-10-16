import { blogContent } from "@/features/blog/content";
import { locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { feedLocale, feedName, feedXml, rssResponse } from "@/lib/seo/feed";
import { getSiteSnapshot } from "@/lib/seo/snapshot";

export const revalidate = 3600;

export function generateStaticParams() {
  return locales.map((locale) => ({ name: feedName(locale) }));
}

export async function GET(_request: Request, context: RouteContext<"/feeds/[name]">) {
  const { name } = await context.params;
  const locale = feedLocale(name);
  if (!locale) return new Response("Not found", { status: 404 });
  const [{ nav }, snapshot] = await Promise.all([getDictionary(locale), getSiteSnapshot()]);
  if (!snapshot[locale].settings.features.blog) return new Response("Not found", { status: 404 });
  const content = blogContent[locale];
  return rssResponse(
    feedXml(locale, snapshot, {
      title: nav.blog,
      description: content.metaDescription,
      kind: (kind) => content.kinds[kind].label,
    }),
  );
}
