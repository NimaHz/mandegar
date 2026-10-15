import type { Variants } from "motion/react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { cn } from "@/lib/cn";

export const navItemClass = (highlighted: boolean) =>
  cn(
    "group relative isolate inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control px-3 text-sm whitespace-nowrap transition-colors",
    highlighted
      ? "font-bold text-primary"
      : "font-semibold text-ink-soft hover:bg-sunken hover:text-ink",
  );

export const iconButtonClass =
  "group relative grid size-10 shrink-0 place-items-center rounded-control text-ink-soft transition-colors hover:bg-sunken hover:text-ink";

export const menuPanelVariants: Variants = {
  hidden: { opacity: 0, y: -6, transition: { duration: 0.2, ease: EASE_OUT_EXPO } },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: EASE_OUT_EXPO,
      staggerChildren: 0.025,
      delayChildren: 0.04,
    },
  },
};

export const menuItemVariants: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE_OUT_EXPO } },
};
