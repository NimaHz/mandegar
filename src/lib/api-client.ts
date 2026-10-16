import { treaty } from "@elysia/eden";

import { isRecord } from "@/lib/guards";
import type { App } from "@/server/app";

export interface ApiFailure {
  status: number;
  code: string;
  fields: Record<string, string>;
}

export type ApiResult<TData> = { ok: true; data: TData } | ({ ok: false } & ApiFailure);

export interface FormToken {
  token: string;
  issuedAt: number;
}

interface EdenResponse<TData> {
  data: TData | null;
  error: { status: unknown; value: unknown } | null;
}

const origin =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    : window.location.origin;

export const apiClient = treaty<App>(origin, {
  fetch: { credentials: "include" },
  parseDate: false,
});

const NETWORK_FAILURE: ApiFailure = { status: 0, code: "NETWORK", fields: {} };

const STATUS_CODES: Partial<Record<number, string>> = {
  413: "PAYLOAD_TOO_LARGE",
  429: "RATE_LIMITED",
};

const stringFields = (value: unknown) =>
  isRecord(value)
    ? Object.fromEntries(
        Object.entries(value).filter(
          (entry): entry is [string, string] => typeof entry[1] === "string",
        ),
      )
    : {};

const failureOf = (status: number, value: unknown): ApiFailure => {
  const body = isRecord(value) && isRecord(value.error) ? value.error : {};
  return {
    status,
    code: typeof body.code === "string" ? body.code : (STATUS_CODES[status] ?? "INTERNAL"),
    fields: stringFields(body.fields),
  };
};

export const apiResult = async <TData>(
  request: Promise<EdenResponse<TData>>,
): Promise<ApiResult<TData>> => {
  const response = await request.catch(() => null);
  if (!response) return { ok: false, ...NETWORK_FAILURE };
  const { data, error } = response;
  if (!error) return data === null ? { ok: false, ...failureOf(0, null) } : { ok: true, data };
  if (error.value instanceof Error) return { ok: false, ...NETWORK_FAILURE };
  return {
    ok: false,
    ...failureOf(typeof error.status === "number" ? error.status : 0, error.value),
  };
};

export const postMultipart = async <TData>(
  path: `/api/${string}`,
  body: FormData,
): Promise<ApiResult<TData>> => {
  const response = await fetch(path, { method: "POST", body, credentials: "include" }).catch(
    () => null,
  );
  if (!response) return { ok: false, ...NETWORK_FAILURE };
  const value: unknown = await response.json().catch(() => null);
  if (!response.ok || value === null) return { ok: false, ...failureOf(response.status, value) };
  return { ok: true, data: value as TData };
};

export const fetchFormToken = async (): Promise<FormToken | null> => {
  const result = await apiResult(apiClient.api.tickets["form-token"].get());
  return result.ok ? { token: result.data.token, issuedAt: Date.now() } : null;
};

const FORM_TOKEN_MIN_AGE_MS = 3_200;
const FORM_TOKEN_MAX_AGE_MS = 100 * 60 * 1000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const readyFormToken = async (current: FormToken | null) => {
  const token =
    current && Date.now() - current.issuedAt <= FORM_TOKEN_MAX_AGE_MS
      ? current
      : await fetchFormToken();
  if (!token) return null;
  const remaining = FORM_TOKEN_MIN_AGE_MS - (Date.now() - token.issuedAt);
  if (remaining > 0) await wait(remaining);
  return token;
};
