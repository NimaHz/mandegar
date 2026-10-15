import { create, type StateCreator } from "zustand";
import { persist, type PersistOptions, type PersistStorage } from "zustand/middleware";

export type PersistedStoreOptions<TState, TPersisted = TState> = Pick<
  PersistOptions<TState, TPersisted>,
  "version" | "migrate" | "partialize" | "merge"
>;

const safeLocalStorage = <TPersisted>(): PersistStorage<TPersisted> => ({
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      return raw === null ? null : JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {}
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
});

export const createPersistedStore = <TState, TPersisted = TState>(
  name: string,
  initializer: StateCreator<TState, [], []>,
  options: PersistedStoreOptions<TState, TPersisted> = {},
) =>
  create<TState>()(
    persist(initializer, {
      version: 1,
      ...options,
      name: `mandegar:${name}`,
      storage: safeLocalStorage<TPersisted>(),
      skipHydration: true,
    }),
  );
