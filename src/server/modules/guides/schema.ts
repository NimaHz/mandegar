import { z } from "@/lib/zod";
import {
  expectedUpdatedAtSchema,
  listQuerySchema,
  localizedText,
  optionalFilter,
  slugSchema,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts } from "@/types/admin";

const aparatHash = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .regex(/^[A-Za-z0-9_-]+$/);

const guideVideoSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("upload"), mediaId: z.uuid(), posterMediaId: z.uuid().nullable() }),
    z.object({ kind: z.literal("aparat"), hash: aparatHash, posterMediaId: z.uuid().nullable() }),
  ])
  .nullable();

export const guideInputSchema = z.object({
  slug: slugSchema,
  title: localizedText(160),
  summary: localizedText(600),
  video: guideVideoSchema,
  durationSec: z.number().int().min(0).max(36_000).nullable(),
  steps: z
    .array(
      z.object({
        title: localizedText(160),
        body: localizedText(3000),
        mediaId: z.uuid().nullable(),
      }),
    )
    .max(60),
  tools: z.array(localizedText(120)).max(40),
  safety: z.array(localizedText(400)).max(40),
  chapters: z
    .array(z.object({ title: localizedText(120), startSec: z.number().int().min(0).max(36_000) }))
    .max(60),
  published: z.boolean(),
});

export const guidePatchSchema = guideInputSchema
  .partial()
  .extend({ expectedUpdatedAt: expectedUpdatedAtSchema });

export const guidesQuerySchema = listQuerySchema.extend({
  published: optionalFilter(z.enum(["true", "false"]).transform((value) => value === "true")),
  sort: sortSchema(adminSorts.guides),
});
