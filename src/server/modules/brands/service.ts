import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { getDb } from "@/server/db/client";
import { brands } from "@/server/db/schema";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound } from "@/server/lib/http-error";
import { revalidateSite } from "@/server/lib/revalidate";
import { brandsAdmin } from "@/services/admin/brands";

import type { brandInputSchema, brandPatchSchema } from "./schema";

const loadBrand = async (id: string) => {
  const brand = await brandsAdmin.get(id);
  if (!brand) throw notFound("Brand not found");
  return brand;
};

export const createBrand = async (input: z.output<typeof brandInputSchema>) => {
  const [row] = await guardWrite(() => getDb().insert(brands).values(input).returning());
  if (!row) throw new Error("Brand insert failed");
  revalidateSite();
  return loadBrand(row.id);
};

export const updateBrand = async (id: string, patch: z.output<typeof brandPatchSchema>) => {
  await loadBrand(id);
  await guardWrite(() => getDb().update(brands).set(patch).where(eq(brands.id, id)));
  revalidateSite();
  return loadBrand(id);
};

export const deleteBrand = async (id: string) => {
  await loadBrand(id);
  await guardDelete(() => getDb().delete(brands).where(eq(brands.id, id)));
  revalidateSite();
  return { id };
};
