import type { Metadata } from "next";

import { UsersList } from "@/features/admin/components/users/users-list";
import { adminContent } from "@/features/admin/content";
import { hasFilters } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { usersQuerySchema } from "@/server/modules/users/schema";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.users.title };

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const { user } = await requireAdmin("users:manage");
  const params = await searchParams;
  const result = await adminApi.users.list(usersQuerySchema.parse(params));
  return <UsersList result={result} currentUserId={user.id} filtered={hasFilters(params)} />;
}
