import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryEditor } from "@/features/admin/components/categories/category-editor";
import { adminContent } from "@/features/admin/content";
import { hasAdminPermission, requireAdmin } from "@/server/auth/session";
import { idSchema } from "@/server/lib/validation";
import { adminApi } from "@/services/admin";

export async function generateMetadata({
  params,
}: PageProps<"/admin/categories/[id]">): Promise<Metadata> {
  const { id } = await params;
  const category =
    idSchema.safeParse(id).success && (await hasAdminPermission("catalog:read"))
      ? await adminApi.categories.get(id)
      : null;
  return { title: category?.name.fa ?? adminContent.categories.title };
}

export default async function AdminCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  const { permissions } = await requireAdmin("catalog:read");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [category, categories, guides] = await Promise.all([
    adminApi.categories.get(id),
    adminApi.categories.options(),
    adminApi.guides.options(),
  ]);
  if (!category) notFound();
  return (
    <CategoryEditor
      key={category.updatedAt}
      category={category}
      categories={categories}
      guides={guides}
      canWrite={permissions.includes("catalog:write")}
    />
  );
}
