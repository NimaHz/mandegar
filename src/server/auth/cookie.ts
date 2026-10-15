import { isProduction } from "@/server/env";

export const SESSION_ABSOLUTE_SEC = 30 * 86_400;

export const sessionCookieName = () => (isProduction() ? "__Host-mandegar_sid" : "mandegar_sid");

export const sessionCookie = (value: string, maxAge = SESSION_ABSOLUTE_SEC) => ({
  value,
  httpOnly: true,
  secure: isProduction(),
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});
