"use client";

import { ChevronUp } from "lucide-react";

import { useDictionary } from "@/i18n/locale-provider";
import { scrollBehavior } from "@/lib/dom";

export function BackToTop() {
  const { ui } = useDictionary();

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: scrollBehavior() })}
      className="group inline-flex size-10 shrink-0 items-center justify-center gap-1.5 rounded-control border border-line bg-surface text-sm font-semibold text-ink-soft transition-colors hover:bg-sunken hover:text-ink sm:w-auto sm:px-3.5"
    >
      <span className="max-sm:sr-only">{ui.backToTop}</span>
      <ChevronUp
        className="size-4 transition-transform duration-300 ease-(--ease-out-expo) group-hover:-translate-y-0.5"
        strokeWidth={2}
        aria-hidden
      />
    </button>
  );
}
