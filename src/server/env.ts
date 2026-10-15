import "server-only";

import { z } from "zod";

import { type Env, getEnv } from "@/config/env";

const serverEnvSchema = z.object({
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().min(1).default("default"),
  S3_BUCKET: z.string().min(1).optional(),
  S3_ACCESS_KEY_ID: z.string().min(1).optional(),
  S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  ALTCHA_COST: z.coerce.number().int().min(1).max(1_000_000).default(5000),
  SMS_DRIVER: z.enum(["console", "kavenegar", "none"]).default("console"),
  KAVENEGAR_API_KEY: z.string().min(1).optional(),
  KAVENEGAR_TEMPLATE_TICKET_RECEIVED: z.string().min(1).default("mandegar-ticket-received"),
  KAVENEGAR_TEMPLATE_TICKET_UPDATED: z.string().min(1).default("mandegar-ticket-updated"),
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
