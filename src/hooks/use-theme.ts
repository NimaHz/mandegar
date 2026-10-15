"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  applyTheme,
  DARK_QUERY,
  isThemePreference,
  type ResolvedTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemePreference,
} from "@/lib/theme";

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

const readPreference = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : "system";
  } catch {
    return "system";
  }
};

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  const media = window.matchMedia(DARK_QUERY);
  const onSystemChange = () => {
    if (readPreference() !== "system") return;
    applyTheme(resolveTheme("system"));
    notify();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    applyTheme(resolveTheme(readPreference()));
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

const getResolved = (): ResolvedTheme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getResolved, () => "light" as const);

  const setTheme = useCallback((preference: ThemePreference) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {}
    applyTheme(resolveTheme(preference));
    notify();
  }, []);

  const toggleTheme = useCallback(
    () => setTheme(getResolved() === "dark" ? "light" : "dark"),
    [setTheme],
  );

  return { theme, setTheme, toggleTheme };
}
