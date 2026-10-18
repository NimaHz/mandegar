"use client";

import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { springSwap } from "./easing";

interface IconSwapProps {
  swapKey: string;
  children: ReactNode;
  instant?: boolean;
  className?: string;
}

export function IconSwap({ swapKey, children, instant = false, className }: IconSwapProps) {
  return (
    <span aria-hidden className={cn("relative grid place-items-center", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        <m.span
          key={swapKey}
          className="grid place-items-center"
          initial={instant ? false : { opacity: 0, scale: 0.4, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={
            instant
              ? { opacity: 0, transition: { duration: 0 } }
              : { opacity: 0, scale: 0.4, rotate: 90 }
          }
          transition={springSwap}
        >
          {children}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
