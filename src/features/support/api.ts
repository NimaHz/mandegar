export interface ApiFailure {
  status: number;
  code: string;
  fields: Record<string, string>;
}

interface ErrorBody {
  error?: { code?: string; fields?: Record<string, string> };
}

export type ApiResult<TData> = { ok: true; data: TData } | ({ ok: false } & ApiFailure);

const failure = async (response: Response): Promise<ApiFailure> => {
  const body = (await response.json().catch(() => ({}))) as ErrorBody;
  return {
    status: response.status,
    code: body.error?.code ?? "INTERNAL",
    fields: body.error?.fields ?? {},
  };
};

export const callApi = async <TData>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<TData>> => {
  try {
    const response = await fetch(path, { cache: "no-store", ...init });
    if (!response.ok) return { ok: false, ...(await failure(response)) };
    return { ok: true, data: (await response.json()) as TData };
  } catch {
    return { ok: false, status: 0, code: "NETWORK", fields: {} };
  }
};

export const postJson = <TData>(path: string, body: unknown) =>
  callApi<TData>(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

export const postForm = <TData>(path: string, body: FormData) =>
  callApi<TData>(path, { method: "POST", body });

export const fetchFormToken = async () => {
  const result = await callApi<{ token: string }>("/api/tickets/form-token");
  return result.ok ? { token: result.data.token, issuedAt: Date.now() } : null;
};
