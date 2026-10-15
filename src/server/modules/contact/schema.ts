import { z } from "zod";

import {
  emailSchema,
  listQuerySchema,
  mobileSchema,
  optionalFilter,
  optionalText,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts, contactStatuses } from "@/types/admin";
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

export const messagesQuerySchema = listQuerySchema.extend({
  status: optionalFilter(z.enum(contactStatuses)),
  department: optionalFilter(z.enum(contactDepartments)),
  sort: sortSchema(adminSorts.messages),
});

export const messageStatusSchema = z.object({ status: z.enum(contactStatuses) });
