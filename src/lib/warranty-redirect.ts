import { siteConfig } from "@/config/site";

import { normalizeCode } from "./codes";
import { routes } from "./routes";

export const warrantyRedirect = (code: string) =>
  Response.redirect(
    new URL(routes.warrantyCode(normalizeCode(code).slice(0, 16)), siteConfig.url),
    308,
  );
