import { z } from "zod";

import { normalizeFa } from "@/lib/persian";
import {
  emailSchema,
  listQuerySchema,
  localeSchema,
  mobileSchema,
  optionalFilter,
  optionalText,
  provinceSchema,
  slugSchema,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts } from "@/types/admin";
import { ticketPriorities, ticketStatuses, ticketTypes } from "@/types/support";

export const TICKET_ATTACHMENT_LIMIT = 5;
export const TICKET_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ticketAttachmentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

const GAS_SMELL = /بو(ی)?\s*گاز|gas\s*(smell|leak)|smell(s|ing)?\s+(of\s+)?gas/i;

export const mentionsGasSmell = (text: string) =>
  GAS_SMELL.test(normalizeFa(text).replace(/‌/g, " "));

export const ticketFieldsSchema = z.object({
  type: z.enum(ticketTypes),
  name: z.string().trim().min(2).max(80),
  phone: mobileSchema,
  email: optionalText(emailSchema),
  province: provinceSchema,
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(5).max(300),
  warrantyCode: optionalText(z.string().trim().max(24)),
  productSlug: optionalText(slugSchema),
  purchaseDate: optionalText(z.iso.date()),
  subject: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(3000),
});

export type TicketFieldsInput = z.input<typeof ticketFieldsSchema>;

export const ticketProofSchema = z.object({
  website: z.string().max(200).optional(),
  formToken: z.string().max(200),
  altcha: z.string().max(8000),
  locale: localeSchema,
});

export const ticketTrackSchema = z.union([
  z.object({
    trackingCode: z.string().trim().min(1).max(24),
    phone: z.string().trim().min(1).max(24),
    locale: localeSchema,
  }),
  z.object({ token: z.string().min(20).max(100), locale: localeSchema }),
]);

export const ticketReplySchema = z.object({
  token: z.string().min(20).max(100),
  body: z.string().trim().min(1).max(3000),
  locale: localeSchema,
});

const flag = optionalFilter(z.enum(["true", "false"]).transform((value) => value === "true"));

export const ticketsQuerySchema = listQuerySchema.extend({
  type: optionalFilter(z.enum(ticketTypes)),
  status: optionalFilter(z.enum(ticketStatuses)),
  priority: optionalFilter(z.enum(ticketPriorities)),
  assigneeId: optionalFilter(z.uuid()),
  breaching: flag,
  open: flag,
  sort: sortSchema(adminSorts.tickets),
});

export const ticketUpdateSchema = z
  .object({
    status: z.enum(ticketStatuses).optional(),
    priority: z.enum(ticketPriorities).optional(),
    assigneeId: z.uuid().nullable().optional(),
  })
  .refine(
    (value) => Object.values(value).some((entry) => entry !== undefined),
    "Nothing to update",
  );

export const staffMessageSchema = z.object({
  body: z.string().trim().min(1).max(5000),
  internal: z.union([
    z.boolean(),
    z.enum(["true", "false"]).transform((value) => value === "true"),
  ]),
});
