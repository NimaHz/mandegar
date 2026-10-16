import { z } from "zod";

import { emailSchema } from "@/server/lib/validation";

export const passwordSchema = z
  .string()
  .min(12)
  .max(200)
  .refine((value) => /[a-z]/i.test(value) && /\d/.test(value), "Use letters and digits");

const totpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(200),
  totp: totpCodeSchema.optional(),
});

export const changePasswordSchema = z
  .object({ currentPassword: z.string().min(1).max(200), newPassword: passwordSchema })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: "Choose a different password",
  });

export const totpEnableSchema = z.object({
  password: z.string().min(1).max(200),
  code: totpCodeSchema,
});

export const totpDisableSchema = totpEnableSchema;

export const sessionParamsSchema = z.object({ id: z.string().regex(/^[0-9a-f]{64}$/) });
