"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import { useId, useState } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { LinkPending } from "@/components/providers/navigation-progress";
import { cn } from "@/lib/cn";

export interface FooterLinkGroup {
  title: string;
  links: { href: Route; label: string }[];
}

interface FooterAccordionProps {
  groups: FooterLinkGroup[];
  className?: string;
}

export function FooterAccordion({ groups, className }: FooterAccordionProps) {
  const [open, setOpen] = useState<string | null>(null);
  const baseId = useId();

  return (
    <div className={cn("flex flex-col divide-y divide-line", className)}>
      {groups.map((group, index) => {
        const isOpen = open === group.title;
        const listId = `${baseId}-${index}`;
        return (
          <div key={group.title}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={isOpen ? listId : undefined}
              onClick={() => setOpen(isOpen ? null : group.title)}
              className="flex h-12 w-full items-center justify-between font-display text-base font-bold text-ink transition-colors hover:text-primary"
            >
              {group.title}
              <ChevronDown
                className={cn(
                  "size-4 text-muted transition-transform duration-300 ease-(--ease-out-expo)",
                  isOpen && "rotate-180",
                )}
                strokeWidth={2.2}
                aria-hidden
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <m.ul
                  id={listId}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                  className="-mx-3 flex flex-col overflow-hidden pb-2"
                >
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="flex h-10 items-center rounded-control px-3 text-sm font-semibold text-ink-soft transition-colors hover:bg-sunken hover:text-ink"
                      >
                        {link.label}
                        <LinkPending />
                      </Link>
                    </li>
                  ))}
                </m.ul>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
