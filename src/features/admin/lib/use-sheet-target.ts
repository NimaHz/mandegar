"use client";

import { useState } from "react";

export type SheetTarget<TItem> = { mode: "create" } | { mode: "edit"; item: TItem } | null;

export function useSheetTarget<TItem>() {
  const [target, setTarget] = useState<SheetTarget<TItem>>(null);
  return {
    target,
    openCreate: () => setTarget({ mode: "create" }),
    openEdit: (item: TItem) => setTarget({ mode: "edit", item }),
    close: () => setTarget(null),
  };
}
