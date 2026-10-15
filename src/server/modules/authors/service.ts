import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { authors } from "@/server/db/schema";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { revalidatePages, revalidateRoutes } from "@/server/lib/revalidate";
import { authorsAdmin } from "@/services/admin/content";

import type { authorInputSchema, authorPatchSchema } from "./schema";

const revalidateAuthor = (slugs: string[]) => {
  revalidatePages([routes.blog, ...slugs.map((slug) => routes.author(slug))]);
  revalidateRoutes(["/blog/[slug]"]);
};

export const createAuthor = async (input: z.output<typeof authorInputSchema>) => {
  const [row] = await guardWrite(() => getDb().insert(authors).values(input).returning());
  if (!row) throw new Error("Author insert failed");
  revalidateAuthor([row.slug]);
  return orNotFound(await authorsAdmin.get(row.id));
};

export const updateAuthor = async (id: string, patch: z.output<typeof authorPatchSchema>) => {
  const before = orNotFound(await authorsAdmin.get(id), "Author not found");
  const [row] = await guardWrite(() =>
    getDb().update(authors).set(patch).where(eq(authors.id, id)).returning(),
  );
  if (!row) throw notFound("Author not found");
  revalidateAuthor([before.slug, row.slug]);
  return orNotFound(await authorsAdmin.get(id));
};

export const deleteAuthor = async (id: string) => {
  const before = orNotFound(await authorsAdmin.get(id), "Author not found");
  await guardDelete(() => getDb().delete(authors).where(eq(authors.id, id)));
  revalidateAuthor([before.slug]);
  return { id };
};
