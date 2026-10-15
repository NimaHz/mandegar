import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import { isRecord } from "@/lib/guards";

import { adminContent } from "../content";

export interface AdminApiError {
  status: number;
  code: string;
  message: string;
  fields: Record<string, string>;
}

export interface EdenFailure {
  status: unknown;
  value: unknown;
}

const errorMessages: Record<string, string> = adminContent.errors;

const stringFields = (value: unknown) =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : {};

export const toApiError = (
  failure: EdenFailure | null,
  retryAfter?: string | null,
): AdminApiError => {
  const status = typeof failure?.status === "number" ? failure.status : 0;
  const body = isRecord(failure?.value) ? failure.value.error : undefined;
  const code =
    isRecord(body) && typeof body.code === "string" ? body.code : status ? "INTERNAL" : "network";
  const base = errorMessages[code] ?? adminContent.errors.unknown;
  const minutes = retryAfter ? Math.max(1, Math.ceil(Number(retryAfter) / 60)) : null;
  const message =
    code === "RATE_LIMITED" && minutes && Number.isFinite(minutes)
      ? `${base} ${fill(adminContent.errors.retryIn, { minutes: formatNumber("fa", minutes) })}`
      : base;
  return { status, code, message, fields: isRecord(body) ? stringFields(body.fields) : {} };
};
