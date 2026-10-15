import type { Metadata } from "next";

import { GuidesList } from "@/features/admin/components/guides/guides-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { guidesQuerySchema } from "@/server/modules/guides/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.guides.title };

export default async function AdminGuidesPage({ searchParams }: PageProps<"/admin/guides">) {
  const { permissions } = await requireAdmin("content:read");
  const params = await searchParams;
  const result = await adminApi.guides.list(guidesQuerySchema.parse(params));
  return (
    <GuidesList
      result={result}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("content:write")}
    />
  );
}
