import { warrantyRedirect } from "@/lib/warranty-redirect";

export async function GET(_request: Request, context: RouteContext<"/w/[code]">) {
  const { code } = await context.params;
  return warrantyRedirect(code);
}
