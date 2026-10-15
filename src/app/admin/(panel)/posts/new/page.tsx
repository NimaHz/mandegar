import type { Metadata } from "next";

import { PostEditor } from "@/features/admin/components/posts/post-editor";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.posts.createTitle };

export default async function AdminNewPostPage() {
  await requireAdmin("content:write");
  const [authors, products] = await Promise.all([
    adminApi.authors.options(),
    adminApi.products.options(),
  ]);
  return <PostEditor post={null} authors={authors} products={products} canWrite />;
}
