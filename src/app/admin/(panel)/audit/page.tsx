import type { Metadata } from "next";

import { AuditList } from "@/features/admin/components/audit/audit-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { auditQuerySchema } from "@/server/modules/audit/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.audit.title };

export default async function AdminAuditPage({ searchParams }: PageProps<"/admin/audit">) {
  await requireAdmin("audit:read");
  const params = await searchParams;
  const [result, users] = await Promise.all([
    adminApi.audit.list(auditQuerySchema.parse(params)),
    adminApi.users.list({ page: 1 }),
  ]);
  const actors = users.items.map((user) => ({
    id: user.id,
    slug: null,
    label: { fa: user.name, en: user.name },
    hint: null,
  }));
  return <AuditList result={result} actors={actors} filtered={hasFilters(params)} />;
}
