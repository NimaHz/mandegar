import type { Metadata } from "next";

import { AccountView } from "@/features/admin/components/account/account-view";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: adminContent.account.title };

export default async function AdminAccountPage() {
  const { user } = await requireAdmin();
  return <AccountView key={`${user.totpEnabled}-${user.mustChangePassword}`} user={user} />;
}
