import { COMPARE_LIMIT } from "@/types/catalog";

import { createPersistedStore } from "./create-persisted-store";

interface CompareState {
  slugs: string[];
  limitNotice: number;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  dismissLimitNotice: () => void;
}

export const useCompareStore = createPersistedStore<CompareState, Pick<CompareState, "slugs">>(
  "compare",
  (set) => ({
    slugs: [],
    limitNotice: 0,
    toggle: (slug) =>
      set((state) => {
        if (state.slugs.includes(slug))
          return { slugs: state.slugs.filter((entry) => entry !== slug), limitNotice: 0 };
        return state.slugs.length >= COMPARE_LIMIT
          ? { limitNotice: state.limitNotice + 1 }
          : { slugs: [...state.slugs, slug], limitNotice: 0 };
      }),
    remove: (slug) =>
      set(({ slugs }) => ({ slugs: slugs.filter((entry) => entry !== slug), limitNotice: 0 })),
    clear: () => set({ slugs: [], limitNotice: 0 }),
    dismissLimitNotice: () => set({ limitNotice: 0 }),
  }),
  {
    partialize: ({ slugs }) => ({ slugs }),
    merge: (persisted, current) => {
      const stored = (persisted as Partial<Pick<CompareState, "slugs">> | undefined)?.slugs;
      return Array.isArray(stored)
        ? { ...current, slugs: [...new Set(stored)].slice(0, COMPARE_LIMIT) }
        : current;
    },
  },
);

export const useIsCompared = (slug: string) =>
  useCompareStore((state) => state.slugs.includes(slug));
