import { z } from "zod";

import { emailSchema, mobileSchema, optionalText } from "@/server/lib/validation";
import { contactDepartments } from "@/types/support";

export const contactSchema = z.object({
  department: z.enum(contactDepartments),
  name: z.string().trim().min(2).max(80),
  phone: mobileSchema,
  email: optionalText(emailSchema),
  subject: z.string().trim().min(3).max(120),
  body: z.string().trim().min(10).max(3000),
});

export const contactRequestSchema = contactSchema.extend({
  website: z.string().max(200).optional(),
  formToken: z.string().max(200),
  altcha: z.string().max(8000),
});

export type ContactInput = z.input<typeof contactSchema>;
