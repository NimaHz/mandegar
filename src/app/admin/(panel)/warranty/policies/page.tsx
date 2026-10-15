import type { Metadata } from "next";

import { PoliciesList } from "@/features/admin/components/policies/policies-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { warrantyPoliciesQuerySchema } from "@/server/modules/warranty/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.policies.title };

export default async function AdminPoliciesPage({
  searchParams,
}: PageProps<"/admin/warranty/policies">) {
  await requireAdmin("warranty:policies");
  const params = await searchParams;
  const result = await adminApi.warrantyPolicies.list(warrantyPoliciesQuerySchema.parse(params));
  return <PoliciesList result={result} filtered={hasFilters(params)} />;
}
