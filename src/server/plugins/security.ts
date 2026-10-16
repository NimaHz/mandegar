import { Elysia } from "elysia";

import { getEnv } from "@/config/env";
import { MB } from "@/lib/format";
import { isProduction } from "@/server/env";
import { sign } from "@/server/lib/crypto";
import { forbidden, HttpError, payloadTooLarge } from "@/server/lib/http-error";
import { stripNulBytes } from "@/server/lib/validation";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const bodyLimits: { pattern: RegExp; bytes: number }[] = [
  { pattern: /^\/api\/admin\/media\/?$/, bytes: 210 * MB },
  { pattern: /^\/api\/tickets(\/[^/]+\/messages)?\/?$/, bytes: 30 * MB },
  { pattern: /^\/api\/admin\/tickets\/[^/]+\/messages\/?$/, bytes: 30 * MB },
];

const bodyLimitFor = (pathname: string) =>
  bodyLimits.find((limit) => limit.pattern.test(pathname))?.bytes ?? MB;

const DEV_TUNNEL_SUFFIXES = [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.app", ".ngrok.io"];

// Dev only: lets the app be reached through localhost or an ngrok tunnel. The hostname must end
// with a tunnel suffix, so look-alikes such as https://ngrok.evil.com are still rejected.
const isDevOrigin = (origin: string) => {
  if (isProduction()) return false;
  try {
    const { protocol, hostname } = new URL(origin);
    if (hostname === "localhost") return true;
    return protocol === "https:" && DEV_TUNNEL_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
  } catch {
    return false;
  }
};

const assertSameOrigin = (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin) {
    if (origin !== new URL(getEnv().APP_ORIGIN).origin && !isDevOrigin(origin)) {
      throw forbidden("Cross-origin request rejected", "ORIGIN_REJECTED");
    }
    return;
  }
  if (request.headers.get("sec-fetch-site") !== "same-origin") {
    throw forbidden("Cross-origin request rejected", "ORIGIN_REJECTED");
  }
};

const assertBodySize = (request: Request, pathname: string) => {
  const length = request.headers.get("content-length");
  if (length === null) {
    if (request.headers.has("transfer-encoding")) {
      throw new HttpError(411, "LENGTH_REQUIRED", "Content-Length is required");
    }
    return;
  }
  const bytes = Number(length);
  if (!Number.isFinite(bytes) || bytes < 0)
    throw new HttpError(400, "BAD_REQUEST", "Invalid Content-Length");
  if (bytes > bodyLimitFor(pathname)) throw payloadTooLarge();
};

export const clientIpOf = (request: Request) => {
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp.slice(0, 64);
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded ? forwarded.slice(0, 64) : null;
};

export const clientKeyOf = (ip: string | null) => sign(ip ?? "unknown", "client-ip").slice(0, 32);

export const userAgentOf = (request: Request) =>
  request.headers.get("user-agent")?.slice(0, 300) ?? null;

export const security = new Elysia({ name: "security" })
  .onRequest(({ request, set }) => {
    set.headers["cache-control"] = "no-store";
    set.headers["x-content-type-options"] = "nosniff";
    if (SAFE_METHODS.has(request.method)) return;
    assertSameOrigin(request);
    assertBodySize(request, new URL(request.url).pathname);
  })
  .onTransform((context) => {
    stripNulBytes(context.query);
    stripNulBytes(context.params);
    context.body = stripNulBytes(context.body);
  })
  .derive({ as: "global" }, ({ request }) => {
    const clientIp = clientIpOf(request);
    return {
      clientIp,
      clientKey: clientKeyOf(clientIp),
      userAgent: userAgentOf(request),
    };
  })
  .as("global");
