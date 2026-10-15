import type { Metadata } from "next";

import { PostsList } from "@/features/admin/components/posts/posts-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { postsQuerySchema } from "@/server/modules/posts/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.posts.title };

export default async function AdminPostsPage({ searchParams }: PageProps<"/admin/posts">) {
  const { permissions } = await requireAdmin("content:read");
  const params = await searchParams;
  const [result, authors] = await Promise.all([
    adminApi.posts.list(postsQuerySchema.parse(params)),
    adminApi.authors.options(),
  ]);
  return (
    <PostsList
      result={result}
      authors={authors}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("content:write")}
    />
  );
}
