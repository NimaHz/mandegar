import { siteConfig } from "@/config/site";
import { routes } from "@/lib/routes";

export const warrantyQrValue = (code: string) =>
  new URL(routes.warrantyShort(code), siteConfig.url).toString().toUpperCase();
