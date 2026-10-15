import type { Metadata } from "next";

import { CentersList } from "@/features/admin/components/centers/centers-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { serviceCentersQuerySchema } from "@/server/modules/service-centers/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.centers.title };

export default async function AdminServiceCentersPage({
  searchParams,
}: PageProps<"/admin/service-centers">) {
  const { permissions } = await requireAdmin("content:read");
  const params = await searchParams;
  const [result, categories] = await Promise.all([
    adminApi.serviceCenters.list(serviceCentersQuerySchema.parse(params)),
    adminApi.categories.options(),
  ]);
  return (
    <CentersList
      result={result}
      categories={categories}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("content:write")}
    />
  );
}
