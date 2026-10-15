import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { getDb } from "@/server/db/client";
import { categories } from "@/server/db/schema";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { conflict, notFound, ValidationFailure } from "@/server/lib/http-error";
import { revalidateSite } from "@/server/lib/revalidate";
import { categoriesAdmin } from "@/services/admin/categories";

import type { categoryInputSchema, categoryPatchSchema } from "./schema";

const loadCategory = async (id: string) => {
  const category = await categoriesAdmin.get(id);
  if (!category) throw notFound("Category not found");
  return category;
};

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
  const [row] = await guardWrite(() => getDb().insert(categories).values(input).returning());
  if (!row) throw new Error("Category insert failed");
  revalidateSite();
  return loadCategory(row.id);
};

export const updateCategory = async (id: string, patch: z.output<typeof categoryPatchSchema>) => {
  await loadCategory(id);
  await assertParent(id, patch.parentId);
  await guardWrite(() => getDb().update(categories).set(patch).where(eq(categories.id, id)));
  revalidateSite();
  return loadCategory(id);
};

export const deleteCategory = async (id: string) => {
  const category = await loadCategory(id);
  if (category.productCount > 0 || (await categoriesAdmin.childCount(id)) > 0) {
    throw conflict("Category still has products or subcategories", "IN_USE");
  }
  await guardDelete(() => getDb().delete(categories).where(eq(categories.id, id)));
  revalidateSite();
  return { id };
};
