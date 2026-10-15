import { z } from "zod";

import {
  listQuerySchema,
  localizedText,
  optionalLocalizedText,
  slugSchema,
} from "@/server/lib/validation";

export const brandInputSchema = z.object({
  slug: slugSchema,
  name: localizedText(80),
  description: optionalLocalizedText(3000),
  logoMediaId: z.uuid().nullable(),
  website: z
    .url({ protocol: /^https?$/ })
    .max(300)
    .nullable(),
  isOwn: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
  published: z.boolean(),
});

export const brandPatchSchema = brandInputSchema.partial();

export const brandsQuerySchema = listQuerySchema;
