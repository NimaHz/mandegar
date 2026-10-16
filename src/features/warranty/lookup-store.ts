import { create } from "zustand";

import type { Locale } from "@/i18n/config";
import type { WarrantyLookup } from "@/types/warranty";

export type ResolvedLookup = Exclude<WarrantyLookup, { status: "invalid" }>;

export type LookupOutcome = ResolvedLookup | { status: "failed" };

interface WarrantyLookupState {
  key: string | null;
  loading: boolean;
  lookup: LookupOutcome | null;
  check: (locale: Locale, code: string, force?: boolean) => Promise<void>;
}

export const lookupKey = (locale: Locale, code: string) => `${locale}:${code}`;

const FAILED: LookupOutcome = { status: "failed" };

const request = async (locale: Locale, code: string): Promise<LookupOutcome | null> => {
  const response = await fetch("/api/warranty/lookup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code, locale }),
  });
  if (response.status === 429) return { status: "rate-limited" };
  if (!response.ok) return FAILED;
  const data: WarrantyLookup = await response.json();
  return data.status === "invalid" ? null : data;
};

export const useWarrantyLookupStore = create<WarrantyLookupState>()((set, get) => ({
  key: null,
  loading: false,
  lookup: null,
  check: async (locale, code, force = false) => {
    const key = lookupKey(locale, code);
    const { key: cachedKey, lookup: cached } = get();
    if (!force && cachedKey === key && cached?.status !== "failed") return;
    set({ key, loading: true, lookup: null });
    const lookup = await request(locale, code).catch(() => FAILED);
    if (get().key === key) set({ loading: false, lookup });
  },
}));
