"use client";

import { m } from "motion/react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { cn } from "@/lib/cn";

interface ProgressBarProps {
  value: number;
  label: string;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, label, className, barClassName }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 overflow-hidden rounded-full bg-chip", className)}
    >
      <m.div
        className={cn("h-full rounded-full bg-primary", barClassName)}
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
      />
    </div>
  );
}
