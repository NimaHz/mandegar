import type { Metadata } from "next";

import { AuthorsList } from "@/features/admin/components/authors/authors-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { authorsQuerySchema } from "@/server/modules/authors/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.authors.title };

export default async function AdminAuthorsPage({ searchParams }: PageProps<"/admin/authors">) {
  const { permissions } = await requireAdmin("content:read");
  const params = await searchParams;
  const result = await adminApi.authors.list(authorsQuerySchema.parse(params));
  return (
    <AuthorsList
      result={result}
      filtered={hasFilters(params)}
      canWrite={permissions.includes("content:write")}
    />
  );
}
