import { z } from "zod";

import { localeSchema } from "@/server/lib/validation";

export const warrantyLookupSchema = z.object({
  code: z.string().max(64),
  locale: localeSchema,
});
