import { z } from "zod";

import {
  listQuerySchema,
  localizedSeoSchema,
  localizedText,
  optionalFilter,
  slugSchema,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts, contentStatuses } from "@/types/admin";
import { postKinds } from "@/types/content";

export const postInputSchema = z.object({
  slug: slugSchema,
  kind: z.enum(postKinds),
  title: localizedText(160),
  excerpt: localizedText(400),
  body: localizedText(60_000),
  coverMediaId: z.uuid().nullable(),
  authorId: z.uuid(),
  relatedProductIds: z.array(z.uuid()).max(12),
  status: z.enum(contentStatuses),
  seo: localizedSeoSchema,
  publishedAt: z.iso.datetime({ offset: true }).nullable().optional(),
});

export const postPatchSchema = postInputSchema.partial();

export const postsQuerySchema = listQuerySchema.extend({
  kind: optionalFilter(z.enum(postKinds)),
  status: optionalFilter(z.enum(contentStatuses)),
  authorId: optionalFilter(z.uuid()),
  sort: sortSchema(adminSorts.posts),
});
