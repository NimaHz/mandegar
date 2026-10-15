import type { Metadata } from "next";

import { FaqsList } from "@/features/admin/components/faqs/faqs-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { faqsQuerySchema } from "@/server/modules/faqs/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.faqs.title };

export default async function AdminFaqsPage({ searchParams }: PageProps<"/admin/faqs">) {
  const { permissions } = await requireAdmin("content:read");
  const params = await searchParams;
  const result = await adminApi.faqs.list(faqsQuerySchema.parse(params));
  return (
    <FaqsList
      result={result}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("content:write")}
    />
  );
}
