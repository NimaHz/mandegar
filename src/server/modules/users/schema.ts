import { z } from "@/lib/zod";
import { emailSchema, listQuerySchema } from "@/server/lib/validation";
import { userRoles } from "@/types/admin";

export const userInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: emailSchema,
  role: z.enum(userRoles),
});

export const userPatchSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    role: z.enum(userRoles).optional(),
    active: z.boolean().optional(),
  })
  .refine(
    (patch) => Object.values(patch).some((value) => value !== undefined),
    "Nothing to update",
  );

export const usersQuerySchema = listQuerySchema;
