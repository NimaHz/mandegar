import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { guides } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { assertUnchanged } from "@/server/lib/concurrency";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, ValidationFailure } from "@/server/lib/http-error";
import { publishedAtFor } from "@/server/lib/published-at";
import { revalidateContent } from "@/server/lib/revalidate";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { guidesAdmin } from "@/services/admin/guides";
import { guideProductSlugs } from "@/services/db/content";

import type { guideInputSchema, guidePatchSchema } from "./schema";

type GuideRow = typeof guides.$inferSelect;

const requireGuide = async (id: string) => {
  const [row] = await getDb().select().from(guides).where(eq(guides.id, id));
  if (!row) throw notFound("Guide not found");
  return row;
};

const loadGuide = async (id: string) => {
  const guide = await guidesAdmin.get(id);
  if (!guide) throw notFound("Guide not found");
  return guide;
};

const listedPaths = async (id: string, rows: GuideRow[]) => {
  const listed = rows.filter((row) => row.published);
  if (listed.length === 0) return [];
  const productSlugs = await guideProductSlugs(id);
  return [
    routes.guides,
    ...listed.map((row) => routes.guide(row.slug)),
    ...productSlugs.map((slug) => routes.product(slug)),
  ];
};

const revalidateGuides = (paths: string[]) => revalidateContent([cacheTags.guides], paths);

const assertGuideMedia = async (input: z.output<typeof guidePatchSchema>) => {
  await assertLibraryMedia(
    { "video.mediaId": input.video?.kind === "upload" ? input.video.mediaId : null },
    "video",
  );
  await assertLibraryMedia(
    {
      "video.posterMediaId": input.video?.posterMediaId,
      ...Object.fromEntries(
        (input.steps ?? []).map((step, index) => [`steps.${index}.mediaId`, step.mediaId]),
      ),
    },
    "image",
  );
};

const assertChapters = ({ durationSec, chapters }: Pick<GuideRow, "durationSec" | "chapters">) => {
  const invalid = chapters.flatMap((chapter, index): [string, string][] => {
    const field = `chapters.${index}.startSec`;
    if (durationSec && chapter.startSec >= durationSec) {
      return [[field, "Must start before the end"]];
    }
    return chapters.findIndex((other) => other.startSec === chapter.startSec) < index
      ? [[field, "Already in use"]]
      : [];
  });
  if (invalid.length > 0) throw new ValidationFailure(Object.fromEntries(invalid));
};

const byStart = (chapters: GuideRow["chapters"]) =>
  chapters.toSorted((first, second) => first.startSec - second.startSec);

export const createGuide = async (input: z.output<typeof guideInputSchema>) => {
  assertChapters(input);
  await assertGuideMedia(input);
  const [row] = await guardWrite(() =>
    getDb()
      .insert(guides)
      .values({
        ...input,
        chapters: byStart(input.chapters),
        publishedAt: publishedAtFor(input.published, null),
      })
      .returning(),
  );
  if (!row) throw new Error("Guide insert failed");
  revalidateGuides(await listedPaths(row.id, [row]));
  return loadGuide(row.id);
};

export const updateGuide = async (
  id: string,
  { expectedUpdatedAt, ...patch }: z.output<typeof guidePatchSchema>,
) => {
  const before = await requireGuide(id);
  assertChapters({
    durationSec: patch.durationSec === undefined ? before.durationSec : patch.durationSec,
    chapters: patch.chapters ?? before.chapters,
  });
  await assertGuideMedia(patch);
  const [row] = await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const [current] = await tx
        .select({
          updatedAt: guides.updatedAt,
          published: guides.published,
          publishedAt: guides.publishedAt,
        })
        .from(guides)
        .where(eq(guides.id, id))
        .for("update");
      if (!current) throw notFound("Guide not found");
      assertUnchanged(current.updatedAt, expectedUpdatedAt);
      return tx
        .update(guides)
        .set({
          ...patch,
          chapters: patch.chapters && byStart(patch.chapters),
          publishedAt: publishedAtFor(patch.published ?? current.published, current.publishedAt),
        })
        .where(eq(guides.id, id))
        .returning();
    }),
  );
  revalidateGuides(await listedPaths(id, row ? [before, row] : [before]));
  return loadGuide(id);
};

export const deleteGuide = async (id: string) => {
  const before = await requireGuide(id);
  const paths = await listedPaths(id, [before]);
  await guardDelete(() => getDb().delete(guides).where(eq(guides.id, id)));
  revalidateGuides(paths);
  return { id };
};
