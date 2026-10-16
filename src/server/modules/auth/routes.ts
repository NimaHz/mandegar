import { Elysia } from "elysia";

import { sessionCookie, sessionCookieName } from "@/server/auth/cookie";
import { auth, readSessionToken } from "@/server/plugins/auth";

import {
  changePasswordSchema,
  loginSchema,
  sessionParamsSchema,
  totpDisableSchema,
  totpEnableSchema,
} from "./schema";
import {
  changePassword,
  disableTotp,
  enableTotp,
  login,
  logout,
  revokeOwnSession,
  sessionsOf,
  setupTotp,
} from "./service";

export const authRoutes = new Elysia({ prefix: "/auth" })
  .use(auth)
  .post(
    "/login",
    async ({ body, cookie, clientIp, clientKey, userAgent }) => {
      const { result, token } = await login(body, {
        ip: clientIp,
        userAgent,
        clientKey,
        previousToken: readSessionToken(cookie),
      });
      if (token) cookie[sessionCookieName()]?.set(sessionCookie(token));
      return result;
    },
    { body: loginSchema },
  )
  .post("/logout", async ({ cookie }) => {
    const result = await logout(readSessionToken(cookie));
    cookie[sessionCookieName()]?.set(sessionCookie("", 0));
    return result;
  })
  .get(
    "/me",
    ({ actor }) => {
      const { sessionId: _sessionId, ip: _ip, userAgent: _userAgent, ...identity } = actor;
      return identity;
    },
    { auth: true },
  )
  .post(
    "/password",
    async ({ actor, body, cookie }) => {
      cookie[sessionCookieName()]?.set(sessionCookie(await changePassword(actor, body)));
      return { ok: true as const };
    },
    { auth: true, body: changePasswordSchema },
  )
  .post("/totp/setup", ({ actor }) => setupTotp(actor), { auth: true })
  .post("/totp/enable", ({ actor, body }) => enableTotp(actor, body), {
    auth: true,
    body: totpEnableSchema,
  })
  .post("/totp/disable", ({ actor, body }) => disableTotp(actor, body), {
    auth: true,
    body: totpDisableSchema,
  })
  .get("/sessions", ({ actor }) => sessionsOf(actor), { auth: true })
  .delete(
    "/sessions/:id",
    async ({ actor, params, cookie }) => {
      const result = await revokeOwnSession(actor, params.id);
      if (result.current) cookie[sessionCookieName()]?.set(sessionCookie("", 0));
      return result;
    },
    { auth: true, params: sessionParamsSchema },
  );
