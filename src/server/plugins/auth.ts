import { type Cookie, Elysia } from "elysia";

import { sessionCookieName } from "@/server/auth/cookie";
import { toIdentity } from "@/server/auth/permissions";
import { validateSession } from "@/server/auth/sessions";
import { forbidden, unauthorized } from "@/server/lib/http-error";
import type { AdminIdentity, Permission } from "@/types/admin";

import { auditMutation } from "./audit";
import { clientIpOf, security, userAgentOf } from "./security";

export interface AdminActor extends AdminIdentity {
  sessionId: string;
  ip: string | null;
  userAgent: string | null;
}

const ADMIN_PATH = /^\/api\/admin(?:\/|$)/;

const sessions = new WeakMap<Request, Promise<AdminActor>>();
const actors = new WeakMap<Request, AdminActor>();

export const readSessionToken = (cookie: Record<string, Cookie<unknown>>) => {
  const value = cookie[sessionCookieName()]?.value;
  return typeof value === "string" ? value : undefined;
};

const sessionTokenOf = (request: Request) => {
  const name = sessionCookieName();
  for (const part of request.headers.get("cookie")?.split(";") ?? []) {
    const separator = part.indexOf("=");
    if (separator !== -1 && part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return undefined;
};

const authenticate = async (request: Request): Promise<AdminActor> => {
  const result = await validateSession(sessionTokenOf(request));
  if (!result) throw unauthorized();
  return {
    ...toIdentity(result.user),
    sessionId: result.session.id,
    ip: clientIpOf(request),
    userAgent: userAgentOf(request),
  };
};

const actorOf = (request: Request) => {
  const known = sessions.get(request);
  if (known) return known;
  const pending = authenticate(request);
  sessions.set(request, pending);
  return pending;
};

const requireActor = (request: Request) => {
  const actor = actors.get(request);
  if (!actor) throw unauthorized();
  return actor;
};

export const auth = new Elysia({ name: "auth" })
  .use(security)
  .onRequest(async ({ request }) => {
    if (ADMIN_PATH.test(new URL(request.url).pathname)) await actorOf(request);
  })
  .macro({
    auth: {
      async transform({ request }) {
        actors.set(request, await actorOf(request));
      },
      resolve({ request }) {
        return { actor: requireActor(request) };
      },
    },
    can: (permission: Permission) => ({
      async transform({ request }) {
        const actor = await actorOf(request);
        if (actor.mustChangePassword) {
          throw forbidden("Password change required", "PASSWORD_CHANGE_REQUIRED");
        }
        if (!actor.permissions.includes(permission)) throw forbidden();
        actors.set(request, actor);
      },
      resolve({ request }) {
        return { actor: requireActor(request) };
      },
      async afterHandle({ request, route, params, body, responseValue, response }) {
        const actor = actors.get(request);
        if (!actor || request.method === "GET") return;
        await auditMutation(actor, {
          method: request.method,
          route,
          params,
          body,
          response: responseValue ?? response,
        });
      },
    }),
  });
