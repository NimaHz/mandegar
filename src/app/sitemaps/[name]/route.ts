import { urlsetXml, xmlResponse } from "@/lib/seo/sitemap-xml";
import { buildSitemaps, isSitemapName, sitemapNames } from "@/lib/seo/sitemaps";
import { getSiteSnapshot } from "@/lib/seo/snapshot";

export const revalidate = 3600;

export function generateStaticParams() {
  return sitemapNames.map((name) => ({ name: `${name}.xml` }));
}

export async function GET(_request: Request, context: RouteContext<"/sitemaps/[name]">) {
  const { name } = await context.params;
  const key = name.replace(/\.xml$/, "");
  if (!name.endsWith(".xml") || !isSitemapName(key)) {
    return new Response("Not found", { status: 404 });
  }
  const sitemaps = buildSitemaps(await getSiteSnapshot());
  return xmlResponse(urlsetXml(sitemaps[key]));
}
