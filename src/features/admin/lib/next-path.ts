import { adminRoutes } from "@/lib/routes";

const ADMIN_PATH = /^\/admin(?:[/?#]|$)/;

export const safeNextPath = (value: string | null | undefined) => {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return adminRoutes.dashboard;
  if (!ADMIN_PATH.test(value) || value.startsWith(adminRoutes.login)) return adminRoutes.dashboard;
  return value;
};
