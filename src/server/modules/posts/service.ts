import "server-only";

import { eq, inArray } from "drizzle-orm";
import type { z } from "zod";

import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { authors, posts } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { assertUnchanged } from "@/server/lib/concurrency";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, orNotFound } from "@/server/lib/http-error";
import { publishedAtFor } from "@/server/lib/published-at";
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

const isLive = (row: PostRow) =>
  row.status === "published" && row.publishedAt !== null && row.publishedAt <= new Date();

const revalidatePosts = async (rows: PostRow[]) => {
  const live = rows.filter(isLive);
  if (live.length === 0) {
    revalidateContent([cacheTags.posts]);
    return;
  }
  const authorRows = await getDb()
    .select({ slug: authors.slug })
    .from(authors)
    .where(
      inArray(
        authors.id,
        live.map((row) => row.authorId),
      ),
    );
  revalidateContent(
    [cacheTags.posts],
    [
      routes.home,
      routes.blog,
      ...live.map((row) => routes.post(row.slug)),
      ...authorRows.map((row) => routes.author(row.slug)),
    ],
  );
};

export const createPost = async (input: z.output<typeof postInputSchema>) => {
  await assertLibraryMedia({ coverMediaId: input.coverMediaId }, "image");
  const [row] = await guardWrite(() =>
    getDb()
      .insert(posts)
      .values({
        ...input,
        publishedAt: publishedAtFor(input.status === "published", null, input.publishedAt),
      })
      .returning(),
  );
  if (!row) throw new Error("Post insert failed");
  await revalidatePosts([row]);
  return orNotFound(await postsAdmin.get(row.id));
};

export const updatePost = async (
  id: string,
  { expectedUpdatedAt, ...patch }: z.output<typeof postPatchSchema>,
) => {
  const before = await requirePost(id);
  await assertLibraryMedia({ coverMediaId: patch.coverMediaId }, "image");
  const [row] = await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const [current] = await tx
        .select({
          updatedAt: posts.updatedAt,
          status: posts.status,
          publishedAt: posts.publishedAt,
        })
        .from(posts)
        .where(eq(posts.id, id))
        .for("update");
      if (!current) throw notFound("Post not found");
      assertUnchanged(current.updatedAt, expectedUpdatedAt);
      return tx
        .update(posts)
        .set({
          ...patch,
          publishedAt: publishedAtFor(
            (patch.status ?? current.status) === "published",
            current.publishedAt,
            patch.publishedAt,
          ),
        })
        .where(eq(posts.id, id))
        .returning();
    }),
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
