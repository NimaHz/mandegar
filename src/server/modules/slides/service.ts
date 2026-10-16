import "server-only";

import { eq, inArray } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { heroSlides } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { assertUnchanged } from "@/server/lib/concurrency";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound, ValidationFailure } from "@/server/lib/http-error";
import { revalidateContent } from "@/server/lib/revalidate";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { slidesAdmin } from "@/services/admin/content";

import type { slideInputSchema, slidePatchSchema } from "./schema";

type SlideRow = typeof heroSlides.$inferSelect;

type SlideWindow = Pick<SlideRow, "startsAt" | "endsAt">;

const toDate = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? null : new Date(value);

const toValues = <TInput extends z.output<typeof slidePatchSchema>>(input: TInput) => ({
  ...input,
  startsAt: toDate(input.startsAt),
  endsAt: toDate(input.endsAt),
});

const assertSlideMedia = (input: z.output<typeof slidePatchSchema>) =>
  assertLibraryMedia(
    {
      imageMediaId: input.imageMediaId,
      mobileImageMediaId: input.mobileImageMediaId,
    },
    "image",
  );

const assertWindow = ({ startsAt, endsAt }: SlideWindow) => {
  if (startsAt && endsAt && endsAt <= startsAt) {
    throw new ValidationFailure({ endsAt: "Must be after the start" });
  }
};

const isShowing = (row: SlideRow, now: Date) =>
  row.active && (!row.startsAt || row.startsAt <= now) && (!row.endsAt || row.endsAt > now);

const revalidateSlides = (rows: SlideRow[]) => {
  const now = new Date();
  revalidateContent(
    [cacheTags.slides],
    rows.some((row) => isShowing(row, now)) ? [routes.home] : [],
  );
};

export const createSlide = async (input: z.output<typeof slideInputSchema>) => {
  const values = {
    ...input,
    startsAt: toDate(input.startsAt) ?? null,
    endsAt: toDate(input.endsAt) ?? null,
  };
  assertWindow(values);
  await assertSlideMedia(input);
  const [row] = await guardWrite(() => getDb().insert(heroSlides).values(values).returning());
  if (!row) throw new Error("Slide insert failed");
  revalidateSlides([row]);
  return orNotFound(await slidesAdmin.get(row.id));
};

export const updateSlide = async (
  id: string,
  { expectedUpdatedAt, ...patch }: z.output<typeof slidePatchSchema>,
) => {
  const values = toValues(patch);
  await assertSlideMedia(patch);
  const [before, row] = await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(heroSlides)
        .where(eq(heroSlides.id, id))
        .for("update");
      if (!current) throw notFound("Slide not found");
      assertUnchanged(current.updatedAt, expectedUpdatedAt);
      assertWindow({
        startsAt: values.startsAt === undefined ? current.startsAt : values.startsAt,
        endsAt: values.endsAt === undefined ? current.endsAt : values.endsAt,
      });
      const [updated] = await tx
        .update(heroSlides)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(heroSlides.id, id))
        .returning();
      if (!updated) throw notFound("Slide not found");
      return [current, updated] as const;
    }),
  );
  revalidateSlides([before, row]);
  return orNotFound(await slidesAdmin.get(id));
};

export const reorderSlides = async (ids: string[]) => {
  const rows = await getDb().transaction(async (tx) => {
    const found = await tx
      .select({ id: heroSlides.id })
      .from(heroSlides)
      .where(inArray(heroSlides.id, ids))
      .for("update");
    if (found.length !== ids.length) {
      throw new ValidationFailure({ ids: "Referenced item not found" });
    }
    const updatedAt = new Date();
    const updated: SlideRow[] = [];
    for (const [index, id] of ids.entries()) {
      const [row] = await tx
        .update(heroSlides)
        .set({ sortOrder: index * 10, updatedAt })
        .where(eq(heroSlides.id, id))
        .returning();
      if (row) updated.push(row);
    }
    return updated;
  });
  revalidateSlides(rows);
  return { ids };
};

export const deleteSlide = async (id: string) => {
  const [row] = await guardDelete(() =>
    getDb().delete(heroSlides).where(eq(heroSlides.id, id)).returning(),
  );
  if (!row) throw notFound("Slide not found");
  revalidateSlides([row]);
  return { id };
};
