import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { serviceCenters } from "@/server/db/schema";
import { guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { revalidatePages } from "@/server/lib/revalidate";
import { serviceCentersAdmin } from "@/services/admin/content";

import type { serviceCenterInputSchema, serviceCenterPatchSchema } from "./schema";

const revalidateCenters = () =>
  revalidatePages([routes.serviceCenters, routes.support, routes.contact]);

export const createServiceCenter = async (input: z.output<typeof serviceCenterInputSchema>) => {
  const [row] = await guardWrite(() =>
    getDb().insert(serviceCenters).values(input).returning({ id: serviceCenters.id }),
  );
  if (!row) throw new Error("Service centre insert failed");
  revalidateCenters();
  return orNotFound(await serviceCentersAdmin.get(row.id));
};

export const updateServiceCenter = async (
  id: string,
  patch: z.output<typeof serviceCenterPatchSchema>,
) => {
  const [row] = await guardWrite(() =>
    getDb()
      .update(serviceCenters)
      .set(patch)
      .where(eq(serviceCenters.id, id))
      .returning({ id: serviceCenters.id }),
  );
  if (!row) throw notFound("Service centre not found");
  revalidateCenters();
  return orNotFound(await serviceCentersAdmin.get(id));
};

export const deleteServiceCenter = async (id: string) => {
  const [row] = await getDb()
    .delete(serviceCenters)
    .where(eq(serviceCenters.id, id))
    .returning({ id: serviceCenters.id });
  if (!row) throw notFound("Service centre not found");
  revalidateCenters();
  return { id };
};
