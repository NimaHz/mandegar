import type { Metadata } from "next";

import { CodesList } from "@/features/admin/components/warranty/codes-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { currentJalaliYear } from "@/lib/dates";
import { requireAdmin } from "@/server/auth/session";
import { warrantyCodesQuerySchema } from "@/server/modules/warranty/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.warranty.title };

const FIRST_YEAR = 1400;

export default async function AdminWarrantyPage({ searchParams }: PageProps<"/admin/warranty">) {
  const { permissions } = await requireAdmin("warranty:read");
  const { generate: _generate, ...params } = await searchParams;
  const query = warrantyCodesQuerySchema.parse(params);
  const [result, products, policies] = await Promise.all([
    adminApi.warrantyCodes.list(query),
    adminApi.products.options(),
    adminApi.warrantyPolicies.options(),
  ]);
  const latest = currentJalaliYear() + 1;
  const years = Array.from({ length: latest - FIRST_YEAR + 1 }, (_, index) => latest - index);

  return (
    <CodesList
      result={result}
      products={products}
      policies={policies}
      years={years}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("warranty:write")}
    />
  );
}
