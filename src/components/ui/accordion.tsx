"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { type ReactNode, useId, useState } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { cn } from "@/lib/cn";

interface AccordionEntry {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionEntry[];
  defaultOpenId?: string | null;
}

export function Accordion({ items, defaultOpenId = null }: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId);
  const baseId = useId();

  return (
    <div className="divide-y divide-line overflow-hidden card">
      {items.map((item) => {
        const isOpen = openId === item.id;
        const triggerId = `${baseId}-${item.id}-trigger`;
        const regionId = `${baseId}-${item.id}-region`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={triggerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={regionId}
                onClick={() => setOpenId(isOpen ? null : item.id)}
                className="flex min-h-15 w-full items-center justify-between gap-4 px-5 py-4 text-start text-lead font-bold text-ink transition-colors hover:bg-raised/60"
              >
                {item.title}
                <ChevronDown
                  className={cn(
                    "size-4.5 shrink-0 text-muted transition-transform duration-300",
                    isOpen && "rotate-180 text-primary",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.div
                  id={regionId}
                  role="region"
                  aria-labelledby={triggerId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 text-sm leading-7 text-body">{item.content}</div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
