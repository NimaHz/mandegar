"use client";

import { useLenis } from "lenis/react";
import { ChevronUp } from "lucide-react";

import { useDictionary } from "@/i18n/locale-provider";

export function BackToTop() {
  const { ui } = useDictionary();
  const lenis = useLenis();

  const scrollToTop = () => {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
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
