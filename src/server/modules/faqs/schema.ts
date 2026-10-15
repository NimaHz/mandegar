import { z } from "zod";

import { listQuerySchema, localizedText, optionalFilter } from "@/server/lib/validation";
import { faqGroups } from "@/types/content";

export const faqInputSchema = z.object({
  group: z.enum(faqGroups),
  question: localizedText(300),
  answer: localizedText(4000),
  sortOrder: z.number().int().min(0).max(10_000),
  published: z.boolean(),
});

export const faqPatchSchema = faqInputSchema.partial();

export const faqsQuerySchema = listQuerySchema.extend({ group: optionalFilter(z.enum(faqGroups)) });
