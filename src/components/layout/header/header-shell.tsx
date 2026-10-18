"use client";

import { type ReactNode, useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

const SCROLLED_OFFSET = 8;

const subscribe = (onChange: () => void) => {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
};

const isScrolledPast = () => window.scrollY > SCROLLED_OFFSET;

export function HeaderShell({ children }: { children: ReactNode }) {
  const isScrolled = useSyncExternalStore(subscribe, isScrolledPast, () => false);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-canvas/85 backdrop-blur-xl transition-[box-shadow,border-color] duration-300",
        isScrolled ? "border-transparent shadow-header" : "border-line",
      )}
    >
      {children}
    </header>
  );
}
