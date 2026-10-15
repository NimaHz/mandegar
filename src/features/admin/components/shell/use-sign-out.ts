"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { apiClient } from "@/lib/api-client";
import { adminRoutes } from "@/lib/routes";

export function useSignOut() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    await apiClient.api.auth.logout.post().catch(() => null);
    router.replace(adminRoutes.login as Route);
    router.refresh();
  };

  return { signOut, pending };
}
