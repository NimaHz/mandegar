import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin/components/dashboard/admin-dashboard";
import { adminContent } from "@/features/admin/content";
import { getAdminStats, getRequestTime } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.dashboard.metaTitle };

export default async function AdminDashboardPage() {
  const { user, permissions } = await requireAdmin("dashboard:read");
  const [stats, audit] = await Promise.all([
    getAdminStats(),
    permissions.includes("audit:read") ? adminApi.audit.list({ page: 1 }) : null,
  ]);

  return (
    <AdminDashboard
      user={user}
      stats={stats}
      audit={audit?.items.slice(0, 6) ?? null}
      now={getRequestTime()}
    />
  );
}
