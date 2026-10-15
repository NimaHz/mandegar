"use client";

import { m } from "motion/react";

import { springSnappy } from "@/components/motion/easing";
import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
}

export function Switch({ checked, onCheckedChange, label, description }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className="flex w-full items-center justify-between gap-4 rounded-field border border-line bg-raised px-4 py-3 text-start"
    >
      <span className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-ink">{label}</span>
        {description && <span className="text-xs text-muted">{description}</span>}
      </span>
      <span
        className={cn(
          "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200",
          checked ? "justify-end bg-primary" : "justify-start bg-line-strong",
        )}
      >
        <m.span layout transition={springSnappy} className="size-5 rounded-full bg-white shadow" />
      </span>
    </button>
  );
}
