import "server-only";

import { and, arrayContains, eq, sql } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { brands, categories, products, serviceCenters } from "@/server/db/schema";
import { assertUnchanged } from "@/server/lib/concurrency";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { conflict, notFound, ValidationFailure } from "@/server/lib/http-error";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { revalidateListing } from "@/server/modules/products/service";
import { categoriesAdmin } from "@/services/admin/categories";

import type { categoryInputSchema, categoryPatchSchema } from "./schema";

const loadCategory = async (id: string) => {
  const category = await categoriesAdmin.get(id);
  if (!category) throw notFound("Category not found");
  return category;
};

const revalidateCategory = (id: string, states: { slug: string; published: boolean }[]) =>
  revalidateListing(states, {
    index: routes.products,
    path: routes.category,
    members: and(eq(products.categoryId, id), eq(brands.published, true)),
  });

const assertParent = async (id: string | null, parentId: string | null | undefined) => {
  if (!parentId) return;
  if (parentId === id)
    throw new ValidationFailure({ parentId: "A category cannot be its own parent" });
  const [parent] = await getDb()
    .select({ parentId: categories.parentId })
    .from(categories)
    .where(eq(categories.id, parentId));
  if (!parent) throw new ValidationFailure({ parentId: "Referenced item not found" });
  if (parent.parentId)
    throw new ValidationFailure({ parentId: "Only one level of nesting is supported" });
  if (id && (await categoriesAdmin.childCount(id)) > 0) {
    throw new ValidationFailure({ parentId: "A category with children cannot become a child" });
  }
};

export const createCategory = async (input: z.output<typeof categoryInputSchema>) => {
  await assertParent(null, input.parentId);
  await assertLibraryMedia({ imageMediaId: input.imageMediaId }, "image");
  const [row] = await guardWrite(() => getDb().insert(categories).values(input).returning());
  if (!row) throw new Error("Category insert failed");
  await revalidateCategory(row.id, [row]);
  return loadCategory(row.id);
};

export const updateCategory = async (
  id: string,
  { expectedUpdatedAt, ...patch }: z.output<typeof categoryPatchSchema>,
) => {
  const before = await loadCategory(id);
  await assertParent(id, patch.parentId);
  await assertLibraryMedia({ imageMediaId: patch.imageMediaId }, "image");
  await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const [row] = await tx
        .select({ updatedAt: categories.updatedAt })
        .from(categories)
        .where(eq(categories.id, id))
        .for("update");
      if (!row) throw notFound("Category not found");
      assertUnchanged(row.updatedAt, expectedUpdatedAt);
      await tx
        .update(categories)
        .set({ ...patch, updatedAt: new Date() })
        .where(eq(categories.id, id));
    }),
  );
  const after = await loadCategory(id);
  await revalidateCategory(id, [before, after]);
  return after;
};

export const deleteCategory = async (id: string) => {
  const category = await loadCategory(id);
  if (category.productCount > 0 || (await categoriesAdmin.childCount(id)) > 0) {
    throw conflict("Category still has products or subcategories", "IN_USE");
  }
  await guardDelete(() =>
    getDb().transaction(async (tx) => {
      await tx.delete(categories).where(eq(categories.id, id));
      await tx
        .update(serviceCenters)
        .set({ categoryIds: sql`array_remove(${serviceCenters.categoryIds}, ${id}::uuid)` })
        .where(arrayContains(serviceCenters.categoryIds, [id]));
    }),
  );
  await revalidateCategory(id, [category]);
  return { id };
};
