import type { Metadata } from "next";

import { AdminDashboard } from "@/features/admin/components/dashboard/admin-dashboard";
import { adminContent } from "@/features/admin/content";
import { getAdminStats, getRequestTime } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

const AUDIT_LIMIT = 6;

export const metadata: Metadata = { title: adminContent.dashboard.metaTitle };

export default async function AdminDashboardPage() {
  const { user, permissions } = await requireAdmin("dashboard:read");
  const [stats, audit] = await Promise.all([
    getAdminStats(permissions),
    permissions.includes("audit:read") ? adminApi.audit.recent(AUDIT_LIMIT) : null,
  ]);

  return <AdminDashboard user={user} stats={stats} audit={audit} now={getRequestTime()} />;
}
