import { z } from "zod";

import {
  expectedUpdatedAtSchema,
  iconSchema,
  listQuerySchema,
  localizedSeoSchema,
  localizedText,
  optionalLocalizedText,
  slugSchema,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts } from "@/types/admin";

import { specGroupTemplateSchema, uniqueSpecKeys } from "../products/schema";

export const categoryInputSchema = z.object({
  slug: slugSchema,
  parentId: z.uuid().nullable(),
  name: localizedText(80),
  summary: localizedText(300),
  description: optionalLocalizedText(5000),
  icon: iconSchema,
  imageMediaId: z.uuid().nullable(),
  defaultGuideId: z.uuid().nullable(),
  specTemplate: z.array(specGroupTemplateSchema).max(20).superRefine(uniqueSpecKeys()),
  seo: localizedSeoSchema,
  sortOrder: z.number().int().min(0).max(10_000),
  published: z.boolean(),
});

export const categoryPatchSchema = categoryInputSchema
  .partial()
  .extend({ expectedUpdatedAt: expectedUpdatedAtSchema });

export const categoriesQuerySchema = listQuerySchema.extend({
  sort: sortSchema(adminSorts.categories),
});
