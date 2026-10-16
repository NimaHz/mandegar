import { adminRoutes } from "@/lib/routes";

const ADMIN_PATH = /^\/admin(?:\/|$)/;
const BASE = "http://admin.invalid";

export const safeNextPath = (value: string | null | undefined) => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return adminRoutes.dashboard;
  const url = new URL(value, BASE);
  if (
    url.origin !== BASE ||
    !ADMIN_PATH.test(url.pathname) ||
    url.pathname.startsWith(adminRoutes.login)
  )
    return adminRoutes.dashboard;
  return `${url.pathname}${url.search}${url.hash}`;
};
