import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostEditor } from "@/features/admin/components/posts/post-editor";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { idSchema } from "@/server/lib/validation";
import { adminApi } from "@/services/admin";

export async function generateMetadata({
  params,
}: PageProps<"/admin/posts/[id]">): Promise<Metadata> {
  const { id } = await params;
  const post = idSchema.safeParse(id).success ? await adminApi.posts.get(id) : null;
  return { title: post?.title.fa ?? adminContent.posts.title };
}

export default async function AdminPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  const { permissions } = await requireAdmin("content:read");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [post, authors, products] = await Promise.all([
    adminApi.posts.get(id),
    adminApi.authors.options(),
    adminApi.products.options(),
  ]);
  if (!post) notFound();
  return (
    <PostEditor
      key={post.updatedAt}
      post={post}
      authors={authors}
      products={products}
      canWrite={permissions.includes("content:write")}
    />
  );
}
