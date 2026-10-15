import { createPersistedStore } from "./create-persisted-store";

export const COMPARE_LIMIT = 3;

interface CompareState {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

export const isCompareFull = ({ slugs }: Pick<CompareState, "slugs">) =>
  slugs.length >= COMPARE_LIMIT;

export const useCompareStore = createPersistedStore<CompareState, Pick<CompareState, "slugs">>(
  "compare",
  (set) => ({
    slugs: [],
    toggle: (slug) =>
      set((state) => {
        if (state.slugs.includes(slug))
          return { slugs: state.slugs.filter((entry) => entry !== slug) };
        return isCompareFull(state) ? state : { slugs: [...state.slugs, slug] };
      }),
    remove: (slug) => set(({ slugs }) => ({ slugs: slugs.filter((entry) => entry !== slug) })),
    clear: () => set({ slugs: [] }),
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

export const useIsCompareFull = () => useCompareStore(isCompareFull);
