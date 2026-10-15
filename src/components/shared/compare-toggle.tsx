"use client";

import { Check, GitCompareArrows } from "lucide-react";

import { IconSwap } from "@/components/motion/icon-swap";
import { compareContent } from "@/features/compare/content";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { useCompareStore, useIsCompared } from "@/stores/compare";
import { useStoresHydrated } from "@/stores/hydration";

interface CompareToggleProps {
  slug: string;
  name: string;
  variant?: "chip" | "button";
  className?: string;
}

const variants = {
  chip: {
    base: "relative z-10 h-7.5 gap-1 rounded-full px-2.5 text-xs",
    idle: "border border-line-strong bg-surface text-ink-soft hover:border-primary hover:text-primary",
    active: "border border-primary bg-primary text-on-primary hover:bg-primary-strong",
    icon: "size-3.5",
  },
  button: {
    base: "h-12 gap-2 rounded-field px-5 text-sm",
    idle: "border border-line-strong bg-surface text-ink hover:border-ink",
    active: "border border-primary bg-primary-soft text-primary hover:border-primary-strong",
    icon: "size-4.5",
  },
} as const;

export function CompareToggle({ slug, name, variant = "chip", className }: CompareToggleProps) {
  const locale = useLocale();
  const { toggle: copy } = compareContent[locale];
  const hydrated = useStoresHydrated();
  const toggle = useCompareStore((state) => state.toggle);
  const compared = useIsCompared(slug);
  const pressed = hydrated && compared;
  const style = variants[variant];

  return (
    <button
      type="button"
      aria-pressed={pressed}
      aria-label={fill(copy.label, { name })}
      disabled={!hydrated}
      onClick={() => toggle(slug)}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-bold whitespace-nowrap transition-[background-color,border-color,color,scale] duration-200 select-none active:scale-[0.97]",
        style.base,
        pressed ? style.active : style.idle,
        className,
      )}
    >
      <IconSwap swapKey={pressed ? "on" : "off"} instant={!hydrated}>
        {pressed ? (
          <Check className={style.icon} strokeWidth={2.6} />
        ) : (
          <GitCompareArrows className={style.icon} strokeWidth={2} />
        )}
      </IconSwap>
      <span aria-hidden>{pressed ? copy.added : copy.add}</span>
    </button>
  );
}
