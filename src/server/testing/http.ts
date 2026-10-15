import { randomBytes } from "node:crypto";

import { app } from "@/server/app";

export const TEST_ORIGIN = "http://localhost:3000";

export const testIp = () => `10.${randomBytes(3).join(".")}`;

export interface TestResponse {
  status: number;
  headers: Headers;
  json: unknown;
}

export const request = async (
  path: string,
  init: RequestInit & { ip?: string; cookie?: string } = {},
): Promise<TestResponse> => {
  const headers = new Headers(init.headers);
  headers.set("origin", TEST_ORIGIN);
  headers.set("x-real-ip", init.ip ?? "10.0.0.1");
  if (init.cookie) headers.set("cookie", init.cookie);
  const response = await app.handle(new Request(`${TEST_ORIGIN}/api${path}`, { ...init, headers }));
  const text = await response.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: response.status, headers: response.headers, json };
};

export const postJson = (
  path: string,
  body: unknown,
  init: { ip?: string; cookie?: string; method?: string } = {},
) =>
  request(path, {
    method: init.method ?? "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    ip: init.ip,
    cookie: init.cookie,
  });

export const field = (value: unknown, key: string): unknown => {
  if (typeof value !== "object" || value === null || !(key in value)) return undefined;
  return (value as Record<string, unknown>)[key];
};
