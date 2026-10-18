import "server-only";

import { z } from "@/lib/zod";

const publishedSessionSecret = "replace-with-at-least-32-random-characters";

export const blankAsUnset = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema);

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  NEXT_PUBLIC_SITE_URL: blankAsUnset(z.url().default("http://localhost:3000")),
  APP_ORIGIN: blankAsUnset(z.url().default("http://localhost:3000")),
  SESSION_SECRET: z
    .string()
    .min(32)
    .refine(
      (value) => value !== publishedSessionSecret,
      "Replace the published placeholder with a random value (openssl rand -hex 32)",
    ),
  SESSION_SECRET_PREVIOUS: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().min(32).optional(),
  ),
  UPLOAD_DIR: blankAsUnset(z.string().min(1).default("uploads")),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export const getEnv = (): Env => {
  if (cached) return cached;
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid environment variables:\n${z.prettifyError(result.error)}`);
  }
  cached = result.data;
  return cached;
};
