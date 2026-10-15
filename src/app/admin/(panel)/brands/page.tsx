import type { Metadata } from "next";

import { BrandsList } from "@/features/admin/components/brands/brands-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { brandsQuerySchema } from "@/server/modules/brands/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.brands.title };

export default async function AdminBrandsPage({ searchParams }: PageProps<"/admin/brands">) {
  const { permissions } = await requireAdmin("catalog:read");
  const params = await searchParams;
  const result = await adminApi.brands.list(brandsQuerySchema.parse(params));
  return (
    <BrandsList
      result={result}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("catalog:write")}
    />
  );
}
