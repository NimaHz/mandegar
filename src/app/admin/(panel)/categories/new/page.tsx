import type { Metadata } from "next";

import { CategoryEditor } from "@/features/admin/components/categories/category-editor";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.categories.createTitle };

export default async function AdminNewCategoryPage() {
  await requireAdmin("catalog:write");
  const [categories, guides] = await Promise.all([
    adminApi.categories.options(),
    adminApi.guides.options(),
  ]);
  return <CategoryEditor category={null} categories={categories} guides={guides} canWrite />;
}
