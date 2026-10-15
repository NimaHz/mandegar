import { createPersistedStore } from "./create-persisted-store";

const RECENTLY_VIEWED_LIMIT = 8;

interface RecentlyViewedState {
  slugs: string[];
  add: (slug: string) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = createPersistedStore<
  RecentlyViewedState,
  Pick<RecentlyViewedState, "slugs">
>(
  "recently-viewed",
  (set) => ({
    slugs: [],
    add: (slug) =>
      set((state) =>
        state.slugs[0] === slug
          ? state
          : {
              slugs: [slug, ...state.slugs.filter((entry) => entry !== slug)].slice(
                0,
                RECENTLY_VIEWED_LIMIT,
              ),
            },
      ),
    clear: () => set({ slugs: [] }),
  }),
  {
    partialize: ({ slugs }) => ({ slugs }),
    merge: (persisted, current) => {
      const stored = (persisted as Partial<Pick<RecentlyViewedState, "slugs">> | undefined)?.slugs;
      return Array.isArray(stored)
        ? { ...current, slugs: [...new Set(stored)].slice(0, RECENTLY_VIEWED_LIMIT) }
        : current;
    },
  },
);
