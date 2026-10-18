"use client";

import * as m from "motion/react-m";
import { useId } from "react";

import { springSnappy } from "@/components/motion/easing";
import { cn } from "@/lib/cn";
import type { Option } from "@/types/common";

interface SegmentedControlProps<TValue extends string> {
  options: readonly Option<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  label: string;
  size?: "sm" | "md";
  className?: string;
}

export function SegmentedControl<TValue extends string>({
  options,
  value,
  onChange,
  label,
  size = "md",
  className,
}: SegmentedControlProps<TValue>) {
  const layoutId = useId();

  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-field border border-line-strong bg-surface p-1",
        className,
      )}
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative isolate shrink-0 rounded-lg transition-colors duration-200",
              size === "sm" ? "h-8 px-3 text-xs" : "h-9.5 px-4 text-label",
              isActive ? "font-bold text-on-inverse" : "font-semibold text-body hover:text-ink",
            )}
          >
            {isActive && (
              <m.span
                layoutId={layoutId}
                transition={springSnappy}
                className="absolute inset-0 -z-10 rounded-lg bg-inverse"
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
