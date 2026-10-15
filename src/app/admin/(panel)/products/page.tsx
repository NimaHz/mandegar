import type { Metadata } from "next";

import { ProductsList } from "@/features/admin/components/products/products-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { productsQuerySchema } from "@/server/modules/products/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.products.title };

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const { permissions } = await requireAdmin("catalog:read");
  const params = await searchParams;
  const query = productsQuerySchema.parse(params);
  const [result, categories, brands] = await Promise.all([
    adminApi.products.list(query),
    adminApi.categories.options(),
    adminApi.brands.options(),
  ]);

  return (
    <ProductsList
      result={result}
      categories={categories}
      brands={brands}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("catalog:write")}
    />
  );
}
