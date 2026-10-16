"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  applyStoredTheme,
  applyTheme,
  DARK_QUERY,
  readThemePreference,
  type ResolvedTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  const media = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (readThemePreference() !== "system") return;
    applyTheme(resolveTheme("system"));
    notify();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyStoredTheme();
    notify();
  };
  media.addEventListener("change", onSystemChange);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    media.removeEventListener("change", onSystemChange);
    window.removeEventListener("storage", onStorage);
  };
};

const subscribePreference = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};

const getResolved = (): ResolvedTheme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getResolved, () => "light" as const);
  const preference = useSyncExternalStore(
    subscribePreference,
    readThemePreference,
    () => "system" as const,
  );

  const setTheme = useCallback((next: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
    applyTheme(resolveTheme(next));
    notify();
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(getResolved() === "dark" ? "light" : "dark"),
    [setTheme],
  );

  return { theme, preference, setTheme, toggleTheme };
}
