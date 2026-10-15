"use client";

import { useMotionValueEvent, useScroll } from "motion/react";
import { type ReactNode, useState } from "react";

import { cn } from "@/lib/cn";

export function HeaderShell({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setIsScrolled(latest > 8));

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
