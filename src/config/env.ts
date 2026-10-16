import "server-only";

import { z } from "zod";

const publishedSessionSecret = "replace-with-at-least-32-random-characters";

const envSchema = z.object({
  DATABASE_URL: z.url({ protocol: /^postgres(ql)?$/ }),
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),
  APP_ORIGIN: z.url().default("http://localhost:3000"),
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
  UPLOAD_DIR: z.string().min(1).default("uploads"),
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
