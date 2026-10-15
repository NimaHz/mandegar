import { create } from "zustand";

import type { Locale } from "@/i18n/config";
import type { WarrantyLookup } from "@/types/warranty";

export type ResolvedLookup = Exclude<WarrantyLookup, { status: "invalid" }>;

interface WarrantyLookupState {
  key: string | null;
  loading: boolean;
  lookup: ResolvedLookup | null;
  check: (locale: Locale, code: string, force?: boolean) => Promise<void>;
}

export const lookupKey = (locale: Locale, code: string) => `${locale}:${code}`;

const request = async (locale: Locale, code: string): Promise<ResolvedLookup | null> => {
  const response = await fetch("/api/warranty/lookup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, locale }),
  });
  if (response.status === 429) return { status: "rate-limited" };
  if (!response.ok) return null;
  const data: WarrantyLookup = await response.json();
  return data.status === "invalid" ? null : data;
};

export const useWarrantyLookupStore = create<WarrantyLookupState>()((set, get) => ({
  key: null,
  loading: false,
  lookup: null,
  check: async (locale, code, force = false) => {
    const key = lookupKey(locale, code);
    if (!force && get().key === key) return;
    set({ key, loading: true, lookup: null });
    const lookup = await request(locale, code).catch(() => null);
    if (get().key === key) set({ loading: false, lookup });
  },
}));
