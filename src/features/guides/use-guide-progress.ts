"use client";

import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

const storageKey = (slug: string) => `mandegar:guide-progress:${slug}`;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
};

const read = (slug: string) => {
  try {
    return localStorage.getItem(storageKey(slug)) ?? "";
  } catch {
    return "";
  }
};

const write = (slug: string, done: number[]) => {
  try {
    if (done.length === 0) localStorage.removeItem(storageKey(slug));
    else localStorage.setItem(storageKey(slug), done.join(","));
  } catch {}
  for (const listener of listeners) listener();
};

const parse = (raw: string, total: number) =>
  raw
    .split(",")
    .filter(Boolean)
    .map(Number)
    .filter((index) => Number.isInteger(index) && index >= 0 && index < total);

export function useGuideProgress(slug: string, total: number) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(slug),
    () => "",
  );
  const done = parse(raw, total);

  const toggle = (index: number) =>
    write(
      slug,
      done.includes(index) ? done.filter((entry) => entry !== index) : [...done, index].toSorted(),
    );

  return { done, toggle, reset: () => write(slug, []) };
}
