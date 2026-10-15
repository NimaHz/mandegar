import { z } from "zod";

import {
  iconSchema,
  listQuerySchema,
  localizedSeoSchema,
  localizedText,
  optionalFilter,
  optionalLocalizedText,
  slugSchema,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts, contentStatuses } from "@/types/admin";
import { downloadKinds, energyClasses } from "@/types/catalog";

const specKey = z
  .string()
  .trim()
  .min(1)
  .max(60)
  .regex(/^[a-zA-Z][a-zA-Z0-9-]*$/);

const unitCode = z.string().trim().max(10).nullable();

export const specTemplateItemSchema = z.object({
  key: specKey,
  label: localizedText(80),
  unit: localizedText(30).nullable(),
  unitCode,
});

export const specGroupTemplateSchema = z.object({
  title: localizedText(80),
  items: z.array(specTemplateItemSchema).max(40),
});

export const specGroupSchema = z.object({
  title: localizedText(80),
  items: z
    .array(
      specTemplateItemSchema.extend({
        value: localizedText(200),
        numeric: z.number().finite().nullable(),
      }),
    )
    .max(40),
});

export const keyFactSchema = z.object({ label: localizedText(60), value: localizedText(120) });

export const featureSchema = z.object({
  icon: iconSchema,
  title: localizedText(80),
  body: localizedText(400),
});

export const downloadSchema = z.object({
  kind: z.enum(downloadKinds),
  title: localizedText(120),
  mediaId: z.uuid(),
});

export const faqItemSchema = z.object({
  question: localizedText(200),
  answer: localizedText(2000),
});

export const productInputSchema = z.object({
  slug: slugSchema,
  modelCode: z
    .string()
    .trim()
    .toUpperCase()
    .min(2)
    .max(40)
    .regex(/^[A-Z0-9][A-Z0-9-]*$/),
  categoryId: z.uuid(),
  brandId: z.uuid(),
  status: z.enum(contentStatuses),
  featured: z.boolean(),
  isNew: z.boolean(),
  releaseYear: z.number().int().min(1990).max(2100).nullable(),
  energyClass: z.enum(energyClasses).nullable(),
  name: localizedText(120),
  tagline: localizedText(200),
  summary: localizedText(600),
  description: localizedText(20_000),
  specs: z.array(specGroupSchema).max(20),
  keyFacts: z.array(keyFactSchema).max(12),
  features: z.array(featureSchema).max(20),
  downloads: z.array(downloadSchema).max(20),
  faqs: z.array(faqItemSchema).max(30),
  guideId: z.uuid().nullable(),
  warrantyMonths: z.number().int().min(0).max(240),
  relatedIds: z.array(z.uuid()).max(12),
  seo: localizedSeoSchema,
});

export const productPatchSchema = productInputSchema.partial();

export const productImagesSchema = z.object({
  images: z
    .array(
      z.object({
        mediaId: z.uuid(),
        alt: optionalLocalizedText(200),
        isPrimary: z.boolean().optional(),
      }),
    )
    .max(30),
});

export const productsQuerySchema = listQuerySchema.extend({
  status: optionalFilter(z.enum(contentStatuses)),
  categoryId: optionalFilter(z.uuid()),
  brandId: optionalFilter(z.uuid()),
  sort: sortSchema(adminSorts.products),
});

export type ProductInput = z.input<typeof productInputSchema>;
