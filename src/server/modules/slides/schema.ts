import { z } from "zod";

import { listQuerySchema, localizedText, urlOrPathSchema } from "@/server/lib/validation";
import { slideTones } from "@/types/admin";

export const slideInputSchema = z.object({
  title: localizedText(120),
  subtitle: localizedText(300),
  ctaLabel: localizedText(40).nullable(),
  ctaHref: urlOrPathSchema.nullable(),
  imageMediaId: z.uuid(),
  mobileImageMediaId: z.uuid().nullable(),
  tone: z.enum(slideTones),
  sortOrder: z.number().int().min(0).max(10_000),
  active: z.boolean(),
  startsAt: z.iso.datetime({ offset: true }).nullable(),
  endsAt: z.iso.datetime({ offset: true }).nullable(),
});

export const slidePatchSchema = slideInputSchema.partial();

export const slideOrderSchema = z.object({
  ids: z
    .array(z.uuid())
    .min(1)
    .max(500)
    .refine((ids) => new Set(ids).size === ids.length, "Each slide may appear once"),
});

export const slidesQuerySchema = listQuerySchema;
