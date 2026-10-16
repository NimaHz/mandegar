import "server-only";

import { isAbsolute } from "node:path";

import { z } from "zod";

import { blankAsUnset, type Env, getEnv } from "@/config/env";

const S3_REQUIRED = [
  "S3_ENDPOINT",
  "S3_BUCKET",
  "S3_ACCESS_KEY_ID",
  "S3_SECRET_ACCESS_KEY",
] as const;

const serverEnvSchema = z
  .object({
    STORAGE_DRIVER: blankAsUnset(z.enum(["local", "s3"]).default("local")),
    S3_ENDPOINT: blankAsUnset(z.url().optional()),
    S3_REGION: blankAsUnset(z.string().min(1).default("default")),
    S3_BUCKET: blankAsUnset(z.string().min(1).optional()),
    S3_ACCESS_KEY_ID: blankAsUnset(z.string().min(1).optional()),
    S3_SECRET_ACCESS_KEY: blankAsUnset(z.string().min(1).optional()),
    ALTCHA_COST: blankAsUnset(z.coerce.number().int().min(1).max(1_000_000).default(2000)),
    SMS_DRIVER: blankAsUnset(z.enum(["console", "kavenegar", "none"]).default("console")),
    KAVENEGAR_API_KEY: blankAsUnset(z.string().min(1).optional()),
    KAVENEGAR_TEMPLATE_TICKET_RECEIVED: blankAsUnset(
      z.string().min(1).default("mandegar-ticket-received"),
    ),
    KAVENEGAR_TEMPLATE_TICKET_UPDATED: blankAsUnset(
      z.string().min(1).default("mandegar-ticket-updated"),
    ),
  })
  .superRefine((env, context) => {
    if (env.SMS_DRIVER === "kavenegar" && !env.KAVENEGAR_API_KEY) {
      context.addIssue({
        code: "custom",
        path: ["KAVENEGAR_API_KEY"],
        message: "Required when SMS_DRIVER=kavenegar",
      });
    }
    if (env.STORAGE_DRIVER === "s3") {
      for (const key of S3_REQUIRED) {
        if (!env[key]) {
          context.addIssue({
            code: "custom",
            path: [key],
            message: "Required when STORAGE_DRIVER=s3",
          });
        }
      }
    }
  });

export type ServerEnv = Env & z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export const getServerEnv = (): ServerEnv => {
  if (cached) return cached;
  const result = serverEnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid server environment:\n${z.prettifyError(result.error)}`);
  }
  cached = { ...getEnv(), ...result.data };
  return cached;
};

export const isProduction = () => process.env.NODE_ENV === "production";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export const isLocalOrigin = (url: string) =>
  URL.canParse(url) && LOCAL_HOSTS.has(new URL(url).hostname);

const PUBLIC_ORIGINS = ["NEXT_PUBLIC_SITE_URL", "APP_ORIGIN"] as const;

const originOf = (url: string | undefined) =>
  url && URL.canParse(url) ? new URL(url).origin : undefined;

export const productionEnvIssues = (
  source: Readonly<Record<string, string | undefined>>,
  builtSiteUrl: string,
) => {
  const value = (key: string) => source[key]?.trim() || undefined;
  const issues: string[] = [];
  for (const key of [...PUBLIC_ORIGINS, "UPLOAD_DIR"]) {
    if (!value(key)) issues.push(`${key}: required in production`);
  }
  for (const key of PUBLIC_ORIGINS) {
    const url = value(key);
    if (url && URL.canParse(url) && new URL(url).protocol !== "https:" && !isLocalOrigin(url)) {
      issues.push(`${key}: must be an https:// origin`);
    }
  }
  const site = originOf(value("NEXT_PUBLIC_SITE_URL"));
  const app = originOf(value("APP_ORIGIN"));
  if (site && app && site !== app) {
    issues.push(`APP_ORIGIN: must be ${site}, the origin of NEXT_PUBLIC_SITE_URL`);
  }
  if (site && site !== originOf(builtSiteUrl)) {
    issues.push(`NEXT_PUBLIC_SITE_URL: this release was built for ${builtSiteUrl}; release again`);
  }
  const uploads = value("UPLOAD_DIR");
  if (uploads && !isAbsolute(uploads)) issues.push("UPLOAD_DIR: must be an absolute path");
  return issues;
};
