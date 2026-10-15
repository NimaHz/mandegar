import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/components/shell/admin-shell";
import { getAdminStats } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";

export default async function AdminPanelLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = await requireAdmin();
  const stats = await getAdminStats();

  return (
    <AdminShell
      user={user}
      counts={{ tickets: stats.tickets.open, messages: stats.messages.unread }}
    >
      {children}
    </AdminShell>
  );
}
