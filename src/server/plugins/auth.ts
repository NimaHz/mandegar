import { type Cookie, Elysia } from "elysia";

import { sessionCookieName } from "@/server/auth/cookie";
import { toIdentity } from "@/server/auth/permissions";
import { validateSession } from "@/server/auth/sessions";
import { forbidden, unauthorized } from "@/server/lib/http-error";
import type { AdminIdentity, Permission } from "@/types/admin";

import { auditMutation } from "./audit";
import { security } from "./security";

export interface AdminActor extends AdminIdentity {
  sessionId: string;
  ip: string | null;
  userAgent: string | null;
}

interface RequestMeta {
  cookie: Record<string, Cookie<unknown>>;
  clientIp: string | null;
  userAgent: string | null;
}

const actors = new WeakMap<Request, AdminActor>();

export const readSessionToken = (cookie: Record<string, Cookie<unknown>>) => {
  const value = cookie[sessionCookieName()]?.value;
  return typeof value === "string" ? value : undefined;
};

const authenticate = async ({ cookie, clientIp, userAgent }: RequestMeta): Promise<AdminActor> => {
  const result = await validateSession(readSessionToken(cookie));
  if (!result) throw unauthorized();
  return { ...toIdentity(result.user), sessionId: result.session.id, ip: clientIp, userAgent };
};

const requireActor = (request: Request) => {
  const actor = actors.get(request);
  if (!actor) throw unauthorized();
  return actor;
};

export const auth = new Elysia({ name: "auth" }).use(security).macro({
  auth: {
    async transform({ cookie, clientIp, userAgent, request }) {
      actors.set(request, await authenticate({ cookie, clientIp, userAgent }));
    },
    resolve({ request }) {
      return { actor: requireActor(request) };
    },
  },
  can: (permission: Permission) => ({
    async transform({ cookie, clientIp, userAgent, request }) {
      const actor = await authenticate({ cookie, clientIp, userAgent });
      if (actor.mustChangePassword) {
        throw forbidden("Password change required", "PASSWORD_CHANGE_REQUIRED");
      }
      if (!actor.permissions.includes(permission)) throw forbidden();
      actors.set(request, actor);
    },
    resolve({ request }) {
      return { actor: requireActor(request) };
    },
    async afterHandle({ request, route, params, body, responseValue }) {
      const actor = actors.get(request);
      if (!actor || request.method === "GET") return;
      await auditMutation(actor, {
        method: request.method,
        route,
        params,
        body,
        response: responseValue,
      });
    },
  }),
});
