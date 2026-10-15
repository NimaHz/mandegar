import { normalizeCode } from "@/lib/codes";
import { routes } from "@/lib/routes";

export async function GET(request: Request, context: RouteContext<"/w/[code]">) {
  const { code } = await context.params;
  const normalized = normalizeCode(code).slice(0, 16);
  return Response.redirect(new URL(routes.warrantyCode(normalized), request.url), 308);
}
