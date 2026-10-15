import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { heroSlides } from "@/server/db/schema";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { revalidatePages } from "@/server/lib/revalidate";
import { slidesAdmin } from "@/services/admin/content";

import type { slideInputSchema, slidePatchSchema } from "./schema";

const toDate = (value: string | null | undefined) =>
  value === undefined ? undefined : value === null ? null : new Date(value);

const toValues = <TInput extends z.output<typeof slidePatchSchema>>(input: TInput) => ({
  ...input,
  startsAt: toDate(input.startsAt),
  endsAt: toDate(input.endsAt),
});

export const createSlide = async (input: z.output<typeof slideInputSchema>) => {
  const [row] = await guardWrite(() =>
    getDb()
      .insert(heroSlides)
      .values({
        ...input,
        startsAt: toDate(input.startsAt) ?? null,
        endsAt: toDate(input.endsAt) ?? null,
      })
      .returning({ id: heroSlides.id }),
  );
  if (!row) throw new Error("Slide insert failed");
  revalidatePages([routes.home]);
  return orNotFound(await slidesAdmin.get(row.id));
};

export const updateSlide = async (id: string, patch: z.output<typeof slidePatchSchema>) => {
  const [row] = await guardWrite(() =>
    getDb()
      .update(heroSlides)
      .set(toValues(patch))
      .where(eq(heroSlides.id, id))
      .returning({ id: heroSlides.id }),
  );
  if (!row) throw notFound("Slide not found");
  revalidatePages([routes.home]);
  return orNotFound(await slidesAdmin.get(id));
};

export const deleteSlide = async (id: string) => {
  const [row] = await guardDelete(() =>
    getDb().delete(heroSlides).where(eq(heroSlides.id, id)).returning({ id: heroSlides.id }),
  );
  if (!row) throw notFound("Slide not found");
  revalidatePages([routes.home]);
  return { id };
};
