"use client";

import { createContext, type ReactNode, use } from "react";

const ReadOnlyContext = createContext(false);

export function ReadOnlyScope({ readOnly, children }: { readOnly: boolean; children: ReactNode }) {
  return <ReadOnlyContext value={readOnly}>{children}</ReadOnlyContext>;
}

export const useReadOnly = () => use(ReadOnlyContext);
