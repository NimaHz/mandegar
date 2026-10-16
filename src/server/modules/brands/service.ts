import "server-only";

import { and, eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { brands, categories, products } from "@/server/db/schema";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound } from "@/server/lib/http-error";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { revalidateListing } from "@/server/modules/products/service";
import { brandsAdmin } from "@/services/admin/brands";

import type { brandInputSchema, brandPatchSchema } from "./schema";

const loadBrand = async (id: string) => {
  const brand = await brandsAdmin.get(id);
  if (!brand) throw notFound("Brand not found");
  return brand;
};

const revalidateBrand = (id: string, states: { slug: string; published: boolean }[]) =>
  revalidateListing(states, {
    index: routes.brands,
    path: routes.brand,
    members: and(eq(products.brandId, id), eq(categories.published, true)),
  });

export const createBrand = async (input: z.output<typeof brandInputSchema>) => {
  await assertLibraryMedia({ logoMediaId: input.logoMediaId }, "image");
  const [row] = await guardWrite(() => getDb().insert(brands).values(input).returning());
  if (!row) throw new Error("Brand insert failed");
  await revalidateBrand(row.id, [row]);
  return loadBrand(row.id);
};

export const updateBrand = async (id: string, patch: z.output<typeof brandPatchSchema>) => {
  const before = await loadBrand(id);
  await assertLibraryMedia({ logoMediaId: patch.logoMediaId }, "image");
  await guardWrite(() =>
    getDb()
      .update(brands)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(brands.id, id)),
  );
  const after = await loadBrand(id);
  await revalidateBrand(id, [before, after]);
  return after;
};

export const deleteBrand = async (id: string) => {
  const before = await loadBrand(id);
  await guardDelete(() => getDb().delete(brands).where(eq(brands.id, id)));
  await revalidateBrand(id, [before]);
  return { id };
};
