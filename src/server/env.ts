import "server-only";

import { z } from "zod";

import { type Env, getEnv } from "@/config/env";

const blankAsUnset = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const serverEnvSchema = z.object({
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
