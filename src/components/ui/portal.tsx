"use client";

import type { ReactNode } from "react";
import { createPortal } from "react-dom";

import { useIsClient } from "@/hooks/use-is-client";

export function Portal({ children }: { children: ReactNode }) {
  const isClient = useIsClient();
  return isClient ? createPortal(children, document.body) : null;
}
