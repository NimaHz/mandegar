import type { Metadata } from "next";

import { CategoriesList } from "@/features/admin/components/categories/categories-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { categoriesQuerySchema } from "@/server/modules/categories/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.categories.title };

export default async function AdminCategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  const { permissions } = await requireAdmin("catalog:read");
  const params = await searchParams;
  const [result, options] = await Promise.all([
    adminApi.categories.list(categoriesQuerySchema.parse(params)),
    adminApi.categories.options(),
  ]);
  const parents = Object.fromEntries(options.map((option) => [option.id, option.label.fa]));
  return (
    <CategoriesList
      result={result}
      parents={parents}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("catalog:write")}
    />
  );
}
