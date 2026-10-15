import { z } from "zod";

import {
  listQuerySchema,
  localizedText,
  optionalLocalizedText,
  slugSchema,
} from "@/server/lib/validation";

export const authorInputSchema = z.object({
  slug: slugSchema,
  name: localizedText(80),
  role: localizedText(80),
  bio: optionalLocalizedText(2000),
  avatarMediaId: z.uuid().nullable(),
  sameAs: z.array(z.url({ protocol: /^https$/ }).max(300)).max(10),
});

export const authorPatchSchema = authorInputSchema.partial();

export const authorsQuerySchema = listQuerySchema;
