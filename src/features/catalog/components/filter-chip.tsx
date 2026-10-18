"use client";

import { X } from "lucide-react";
import * as m from "motion/react-m";

import { springSnappy } from "@/components/motion/easing";

interface FilterChipProps {
  label: string;
  removeLabel: string;
  onRemove: () => void;
}

export function FilterChip({ label, removeLabel, onRemove }: FilterChipProps) {
  return (
    <m.li
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={springSnappy}
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="group inline-flex h-8 max-w-60 items-center gap-1.5 rounded-full border border-primary/20 bg-primary-soft ps-3 pe-2 text-xs font-bold text-primary transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
      >
        <bdi className="truncate">{label}</bdi>
        <X
          className="size-3.5 shrink-0 transition-transform duration-300 group-hover:rotate-90"
          strokeWidth={2.4}
          aria-hidden
        />
      </button>
    </m.li>
  );
}
