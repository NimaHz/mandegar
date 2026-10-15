import { loadOgCard } from "@/lib/seo/og/cards";
import { renderOgImage } from "@/lib/seo/og/render";
import { parseOgPath } from "@/lib/seo/og/targets";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(_request: Request, context: RouteContext<"/og/[...slug]">) {
  const { slug } = await context.params;
  const parsed = parseOgPath(slug);
  if (!parsed) return notFound();
  const card = await loadOgCard(parsed.locale, parsed.target);
  if (!card) return notFound();
  const png = await renderOgImage(card);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
