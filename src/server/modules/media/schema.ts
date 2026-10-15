import { z } from "zod";

import {
  listQuerySchema,
  optionalFilter,
  optionalLocalizedText,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts, mediaKinds } from "@/types/admin";

export const mediaQuerySchema = listQuerySchema.extend({
  kind: optionalFilter(z.enum(mediaKinds)),
  sort: sortSchema(adminSorts.media),
});

export const mediaPatchSchema = z.object({ alt: optionalLocalizedText(200) });

export const mediaUploadFieldsSchema = z.object({
  altFa: z.string().trim().max(200).optional(),
  altEn: z.string().trim().max(200).optional(),
});
