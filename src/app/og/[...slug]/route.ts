import { loadOgCard } from "@/lib/seo/og/cards";
import { renderOgImage } from "@/lib/seo/og/render";
import { parseOgPath } from "@/lib/seo/og/targets";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404 });

export async function GET(request: Request, context: RouteContext<"/og/[...slug]">) {
  const { slug } = await context.params;
  const parsed = parseOgPath(slug);
  if (!parsed) return notFound();
  const loaded = await loadOgCard(parsed.locale, parsed.target);
  if (!loaded) return notFound();
  const { pathname, search } = new URL(request.url);
  if (`${pathname}${search}` !== loaded.path) {
    return new Response(null, {
      status: 308,
      headers: { Location: loaded.path, "Cache-Control": "no-store" },
    });
  }
  const png = await renderOgImage(await loaded.card());
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": String(png.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
