import "server-only";

import { getDb } from "@/server/db/client";
import { auditLogs } from "@/server/db/schema";
import type { JsonValue } from "@/types/admin";

interface AuditEntry {
  actorId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  diff: JsonValue;
  ip: string | null;
  userAgent: string | null;
}

interface AuditContext {
  method: string;
  route: string;
  params: Record<string, string | undefined> | undefined;
  body: unknown;
  response: unknown;
}

const REDACTED_KEY = /password|secret|token|totp|altcha/i;
const MAX_TEXT = 2_000;
const MAX_DEPTH = 6;

const toAuditJson = (value: unknown, depth = 0): JsonValue => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string")
    return value.length > MAX_TEXT ? `${value.slice(0, MAX_TEXT)}…` : value;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof File) return { file: value.name, size: value.size, type: value.type };
  if (depth >= MAX_DEPTH || typeof value !== "object") return null;
  if (Array.isArray(value)) return value.slice(0, 100).map((item) => toAuditJson(item, depth + 1));
  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      REDACTED_KEY.test(key) && typeof item === "string"
        ? "[redacted]"
        : toAuditJson(item, depth + 1),
    ]),
  );
};

const verbOf = (method: string) => {
  if (method === "POST") return "create";
  if (method === "DELETE") return "delete";
  return "update";
};

const describeRoute = (method: string, route: string) => {
  const segments = route.split("/").filter(Boolean);
  const adminIndex = segments.indexOf("admin");
  const entity = segments[adminIndex + 1] ?? "unknown";
  const rest = segments.slice(adminIndex + 2).filter((segment) => !segment.startsWith(":"));
  return { entity, action: rest.length > 0 ? rest.join(".") : verbOf(method) };
};

const idOf = (value: unknown) =>
  typeof value === "object" && value !== null && "id" in value && typeof value.id === "string"
    ? value.id
    : null;

const responseId = (response: unknown) =>
  idOf(response) ??
  (typeof response === "object" && response !== null
    ? (Object.values(response)
        .map(idOf)
        .find((id) => id !== null) ?? null)
    : null);

export const recordAudit = async (entry: AuditEntry) => {
  await getDb()
    .insert(auditLogs)
    .values(entry)
    .catch((error: unknown) => console.error(error));
};

export const auditMutation = async (
  actor: { id: string; ip: string | null; userAgent: string | null },
  context: AuditContext,
) => {
  const { entity, action } = describeRoute(context.method, context.route);
  await recordAudit({
    actorId: actor.id,
    action,
    entity,
    entityId: context.params?.id ?? responseId(context.response),
    diff: toAuditJson(context.body),
    ip: actor.ip,
    userAgent: actor.userAgent,
  });
};
