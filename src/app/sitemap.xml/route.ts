import { sitemapIndexXml, xmlResponse } from "@/lib/seo/sitemap-xml";
import { buildSitemaps, sitemapNames } from "@/lib/seo/sitemaps";
import { getSiteSnapshot, latest } from "@/lib/seo/snapshot";

export const revalidate = 3600;

export async function GET() {
  const sitemaps = buildSitemaps(await getSiteSnapshot());
  return xmlResponse(
    sitemapIndexXml(
      sitemapNames
        .filter((name) => sitemaps[name].length > 0)
        .map((name) => ({
          path: `/sitemaps/${name}.xml`,
          lastModified: latest(...sitemaps[name].map((entry) => entry.lastModified)),
        })),
    ),
  );
}
