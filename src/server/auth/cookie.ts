import { SESSION_COOKIE_NAMES } from "@/lib/admin-hint";
import { isProduction } from "@/server/env";

export const SESSION_ABSOLUTE_SEC = 30 * 86_400;

export const sessionCookieName = () => SESSION_COOKIE_NAMES[isProduction() ? 0 : 1];

export const sessionCookie = (value: string, maxAge = SESSION_ABSOLUTE_SEC) => ({
  value,
  httpOnly: true,
  secure: isProduction(),
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});
