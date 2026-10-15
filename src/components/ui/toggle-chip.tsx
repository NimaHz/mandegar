"use client";

import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

interface ToggleChipProps extends Omit<ComponentProps<"button">, "onChange"> {
  pressed: boolean;
  onPressedChange: (pressed: boolean) => void;
  size?: "sm" | "md";
}

export function ToggleChip({
  pressed,
  onPressedChange,
  size = "md",
  className,
  children,
  ...props
}: ToggleChipProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-full border font-semibold transition-colors duration-200",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-label",
        pressed
          ? "border-inverse bg-inverse text-on-inverse"
          : "border-ink/70 bg-transparent text-ink hover:bg-ink/5",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
