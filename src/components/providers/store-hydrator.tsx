"use client";

import { useEffect } from "react";

import { rehydratePersistedStores } from "@/stores/hydration";

export function StoreHydrator() {
  useEffect(() => {
    void rehydratePersistedStores();
  }, []);

  return null;
}
