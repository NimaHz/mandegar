import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { LoginView } from "@/features/admin/components/auth/login-view";
import { adminContent } from "@/features/admin/content";
import { safeNextPath } from "@/features/admin/lib/next-path";
import { adminRoutes } from "@/lib/routes";
import { getAdmin } from "@/server/auth/session";

export const metadata: Metadata = { title: adminContent.login.metaTitle };

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { next } = await searchParams;
  const target = safeNextPath(typeof next === "string" ? next : undefined);
  const user = await getAdmin();
  if (user) redirect((user.mustChangePassword ? adminRoutes.account : target) as Route);
  return <LoginView next={target} />;
}
