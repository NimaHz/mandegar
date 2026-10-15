import "server-only";

import type { Route } from "next";
import { cookies, headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { adminPathHeader, adminRoutes } from "@/lib/routes";
import type { AdminIdentity, Permission } from "@/types/admin";

import { sessionCookieName } from "./cookie";
import { toIdentity } from "./permissions";
import { validateSession } from "./sessions";

export interface AdminContext {
  user: AdminIdentity;
  permissions: Permission[];
}

export const getAdmin = cache(async (): Promise<AdminIdentity | null> => {
  const store = await cookies();
  const result = await validateSession(store.get(sessionCookieName())?.value);
  return result ? toIdentity(result.user) : null;
});

const loginPath = async () => {
  const path = (await headers()).get(adminPathHeader);
  return path ? adminRoutes.loginFrom(path) : adminRoutes.login;
};

export const requireAdmin = async (permission?: Permission): Promise<AdminContext> => {
  const user = await getAdmin();
  if (!user) redirect((await loginPath()) as Route);
  if (permission && user.mustChangePassword) redirect(adminRoutes.account as Route);
  if (permission && !user.permissions.includes(permission)) notFound();
  return { user, permissions: user.permissions };
};
