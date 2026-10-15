import { Elysia } from "elysia";

import { isProduction } from "@/server/env";
import { type ErrorCode, isHttpError, isValidationFailure } from "@/server/lib/http-error";

interface IssueLike {
  path?: unknown;
  message?: unknown;
}

const fieldKey = (path: unknown) => {
  if (Array.isArray(path)) return path.map(String).join(".");
  return typeof path === "string" ? path.replace(/^\//, "").replaceAll("/", ".") : "";
};

const collectFields = (issues: readonly IssueLike[]) => {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = fieldKey(issue.path) || "_";
    if (!fields[key] && typeof issue.message === "string") fields[key] = issue.message;
  }
  return fields;
};

const errorBody = (code: ErrorCode, message: string, fields?: Record<string, string>) => ({
  error: fields && Object.keys(fields).length > 0 ? { code, message, fields } : { code, message },
});

const issuesOf = (error: unknown): IssueLike[] => {
  if (typeof error !== "object" || error === null || !("all" in error)) return [];
  const { all } = error;
  return Array.isArray(all)
    ? all.filter((issue): issue is IssueLike => typeof issue === "object" && issue !== null)
    : [];
};

const isMalformedBody = (error: unknown) =>
  error instanceof SyntaxError ||
  (error instanceof TypeError && error.message.startsWith("Failed to parse body"));

const isWrongContentType = (error: unknown) =>
  error instanceof TypeError && error.message.startsWith("Content-Type was not one of");

export const errors = new Elysia({ name: "errors" }).onError(
  { as: "global" },
  ({ code, error, set }) => {
    if (isValidationFailure(error)) {
      set.status = 422;
      return errorBody("VALIDATION", error.message, error.fields);
    }
    if (isHttpError(error)) {
      set.status = error.status;
      if (error.retryAfterSec !== null) set.headers["retry-after"] = String(error.retryAfterSec);
      return errorBody(error.code, error.message);
    }
    if (code === "VALIDATION") {
      set.status = 422;
      return errorBody("VALIDATION", "Invalid request", collectFields(issuesOf(error)));
    }
    if (code === "NOT_FOUND") {
      set.status = 404;
      return errorBody("NOT_FOUND", "Not found");
    }
    if (code === "PARSE" || isMalformedBody(error)) {
      set.status = 400;
      return errorBody("BAD_REQUEST", "Malformed request body");
    }
    if (isWrongContentType(error)) {
      set.status = 415;
      return errorBody("UNSUPPORTED_MEDIA", "Content type is not supported");
    }
    if (code === "INVALID_FILE_TYPE") {
      set.status = 415;
      return errorBody("UNSUPPORTED_MEDIA", "File type is not allowed");
    }
    console.error(error);
    set.status = 500;
    const message =
      !isProduction() && error instanceof Error ? error.message : "Internal server error";
    return errorBody("INTERNAL", message);
  },
);
