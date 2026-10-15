import { useSyncExternalStore } from "react";

import { useCompareStore } from "./compare";
import { useRecentlyViewedStore } from "./recently-viewed";

const persistedStores = [useCompareStore, useRecentlyViewedStore] as const;

export const rehydratePersistedStores = () =>
  Promise.all(persistedStores.map((store) => store.persist.rehydrate()));

const subscribe = (onChange: () => void) => {
  const unsubscribers = persistedStores.map((store) => store.persist.onFinishHydration(onChange));
  return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
};

const getSnapshot = () => persistedStores.every((store) => store.persist.hasHydrated());

const getServerSnapshot = () => false;

export const useStoresHydrated = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
