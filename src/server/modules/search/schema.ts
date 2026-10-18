import { z } from "@/lib/zod";
import { localeSchema } from "@/server/lib/validation";

export const searchQuerySchema = z.object({
  q: z.string().trim().max(100).catch(""),
  locale: localeSchema,
});
