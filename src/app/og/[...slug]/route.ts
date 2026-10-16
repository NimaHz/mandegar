import { loadOgCard } from "@/lib/seo/og/cards";
import { renderOgImage } from "@/lib/seo/og/render";
import { type OgTarget, parseOgPath } from "@/lib/seo/og/targets";
import { api } from "@/services";

export const runtime = "nodejs";

const notFound = () => new Response("Not found", { status: 404 });

const isJournalTarget = (target: OgTarget) =>
  target.kind === "post" ||
  target.kind === "author" ||
  (target.kind === "page" && target.key === "blog");

export async function GET(request: Request, context: RouteContext<"/og/[...slug]">) {
  const { slug } = await context.params;
  const parsed = parseOgPath(slug);
  if (!parsed) return notFound();
  if (isJournalTarget(parsed.target)) {
    const { features } = await api.content.settings(parsed.locale);
    if (!features.blog) return notFound();
  }
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
