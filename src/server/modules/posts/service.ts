import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { authors, posts } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { revalidateContent } from "@/server/lib/revalidate";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { postsAdmin } from "@/services/admin/content";

import type { postInputSchema, postPatchSchema } from "./schema";

type PostRow = typeof posts.$inferSelect;

const requirePost = async (id: string) => {
  const [row] = await getDb().select().from(posts).where(eq(posts.id, id));
  if (!row) throw notFound("Post not found");
  return row;
};

const revalidatePosts = async (rows: PostRow[]) => {
  const authorSlugs = await Promise.all(
    [...new Set(rows.map((row) => row.authorId))].map(async (authorId) => {
      const [author] = await getDb()
        .select({ slug: authors.slug })
        .from(authors)
        .where(eq(authors.id, authorId));
      return author ? routes.author(author.slug) : null;
    }),
  );
  revalidateContent(
    [cacheTags.posts],
    [routes.home, routes.blog, ...rows.map((row) => routes.post(row.slug)), ...authorSlugs],
  );
};

const publishedAtFor = (
  status: PostRow["status"] | undefined,
  requested: string | null | undefined,
  current: Date | null,
) => {
  if (requested !== undefined) return requested === null ? null : new Date(requested);
  return status === "published" && !current ? new Date() : current;
};

export const createPost = async (input: z.output<typeof postInputSchema>) => {
  await assertLibraryMedia({ coverMediaId: input.coverMediaId });
  const [row] = await guardWrite(() =>
    getDb()
      .insert(posts)
      .values({ ...input, publishedAt: publishedAtFor(input.status, input.publishedAt, null) })
      .returning(),
  );
  if (!row) throw new Error("Post insert failed");
  await revalidatePosts([row]);
  return orNotFound(await postsAdmin.get(row.id));
};

export const updatePost = async (id: string, patch: z.output<typeof postPatchSchema>) => {
  const before = await requirePost(id);
  await assertLibraryMedia({ coverMediaId: patch.coverMediaId });
  const [row] = await guardWrite(() =>
    getDb()
      .update(posts)
      .set({
        ...patch,
        publishedAt: publishedAtFor(patch.status, patch.publishedAt, before.publishedAt),
      })
      .where(eq(posts.id, id))
      .returning(),
  );
  await revalidatePosts(row ? [before, row] : [before]);
  return orNotFound(await postsAdmin.get(id));
};

export const deletePost = async (id: string) => {
  const before = await requirePost(id);
  await guardDelete(() => getDb().delete(posts).where(eq(posts.id, id)));
  await revalidatePosts([before]);
  return { id };
};
