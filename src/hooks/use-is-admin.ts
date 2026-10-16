"use client";

import { useEffect, useState } from "react";

import { clearAdminHint, hasAdminHint } from "@/lib/admin-hint";
import { apiClient } from "@/lib/api-client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!hasAdminHint()) return;
    let active = true;
    void apiClient.api.auth.me.get().then(({ error }) => {
      if (!active) return;
      if (error) clearAdminHint();
      setIsAdmin(!error);
    });
    return () => {
      active = false;
    };
  }, []);

  return isAdmin;
}
