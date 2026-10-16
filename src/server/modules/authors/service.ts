import "server-only";

import { and, count, eq, lte } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { authors, posts } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { revalidateContent } from "@/server/lib/revalidate";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { authorsAdmin } from "@/services/admin/content";

import type { authorInputSchema, authorPatchSchema } from "./schema";

const revalidateAuthor = async (id: string, slugs: string[]) => {
  const [row] = await getDb()
    .select({ total: count() })
    .from(posts)
    .where(
      and(
        eq(posts.authorId, id),
        eq(posts.status, "published"),
        lte(posts.publishedAt, new Date()),
      ),
    );
  revalidateContent(
    [cacheTags.posts],
    row && row.total > 0 ? [routes.blog, ...slugs.map((slug) => routes.author(slug))] : [],
  );
};

export const createAuthor = async (input: z.output<typeof authorInputSchema>) => {
  await assertLibraryMedia({ avatarMediaId: input.avatarMediaId }, "image");
  const [row] = await guardWrite(() => getDb().insert(authors).values(input).returning());
  if (!row) throw new Error("Author insert failed");
  await revalidateAuthor(row.id, [row.slug]);
  return orNotFound(await authorsAdmin.get(row.id));
};

export const updateAuthor = async (id: string, patch: z.output<typeof authorPatchSchema>) => {
  const before = orNotFound(await authorsAdmin.get(id), "Author not found");
  await assertLibraryMedia({ avatarMediaId: patch.avatarMediaId }, "image");
  const [row] = await guardWrite(() =>
    getDb()
      .update(authors)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(authors.id, id))
      .returning(),
  );
  if (!row) throw notFound("Author not found");
  await revalidateAuthor(id, [before.slug, row.slug]);
  return orNotFound(await authorsAdmin.get(id));
};

export const deleteAuthor = async (id: string) => {
  const before = orNotFound(await authorsAdmin.get(id), "Author not found");
  await guardDelete(() => getDb().delete(authors).where(eq(authors.id, id)));
  await revalidateAuthor(id, [before.slug]);
  return { id };
};
