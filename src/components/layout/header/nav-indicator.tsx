"use client";

import { m } from "motion/react";

import { springSnappy } from "@/components/motion/easing";

export function NavIndicator({ layoutId }: { layoutId: string }) {
  return (
    <m.span
      layoutId={layoutId}
      transition={springSnappy}
      className="absolute inset-0 -z-10 rounded-control bg-primary-soft"
    />
  );
}
