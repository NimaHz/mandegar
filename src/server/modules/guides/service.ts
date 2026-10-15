import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { guides } from "@/server/db/schema";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound } from "@/server/lib/http-error";
import { revalidatePages, revalidateRoutes } from "@/server/lib/revalidate";
import { guidesAdmin } from "@/services/admin/guides";

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

const revalidateGuides = (rows: GuideRow[]) => {
  revalidatePages([routes.guides, ...rows.map((row) => routes.guide(row.slug))]);
  revalidateRoutes(["/products/[slug]", "/categories/[slug]"]);
};

const publishedAtFor = (published: boolean | undefined, current: Date | null) =>
  published && !current ? new Date() : current;

export const createGuide = async (input: z.output<typeof guideInputSchema>) => {
  const [row] = await guardWrite(() =>
    getDb()
      .insert(guides)
      .values({ ...input, publishedAt: publishedAtFor(input.published, null) })
      .returning(),
  );
  if (!row) throw new Error("Guide insert failed");
  revalidateGuides([row]);
  return loadGuide(row.id);
};

export const updateGuide = async (id: string, patch: z.output<typeof guidePatchSchema>) => {
  const before = await requireGuide(id);
  const [row] = await guardWrite(() =>
    getDb()
      .update(guides)
      .set({ ...patch, publishedAt: publishedAtFor(patch.published, before.publishedAt) })
      .where(eq(guides.id, id))
      .returning(),
  );
  revalidateGuides(row ? [before, row] : [before]);
  return loadGuide(id);
};

export const deleteGuide = async (id: string) => {
  const before = await requireGuide(id);
  await guardDelete(() => getDb().delete(guides).where(eq(guides.id, id)));
  revalidateGuides([before]);
  return { id };
};
