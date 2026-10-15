import type { ReactNode } from "react";

import { AdminShell } from "@/features/admin/components/shell/admin-shell";
import { getAdminCounts } from "@/features/admin/data";
import { requireAdmin } from "@/server/auth/session";

export default async function AdminPanelLayout({ children }: Readonly<{ children: ReactNode }>) {
  const { user } = await requireAdmin();
  const counts = await getAdminCounts();

  return (
    <AdminShell
      user={user}
      counts={{ tickets: counts.openTickets, messages: counts.unreadMessages }}
    >
      {children}
    </AdminShell>
  );
}
