"use client";

import { ChevronDown, ListTree } from "lucide-react";
import { m } from "motion/react";
import { useEffect, useId, useState } from "react";

import { springSnappy } from "@/components/motion/easing";
import { cn } from "@/lib/cn";

interface TocHeading {
  id: string;
  text: string;
  depth: number;
}

interface PostTocProps {
  headings: TocHeading[];
  label: string;
  showLabel: string;
  hideLabel: string;
}

export function PostToc({ headings, label, showLabel, hideLabel }: PostTocProps) {
  const listId = useId();
  const markerId = useId();
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.set(entry.target.id, entry.boundingClientRect.top);
          else visible.delete(entry.target.id);
        }
        const topmost = [...visible.entries()].toSorted((a, b) => a[1] - b[1])[0];
        if (topmost) setActiveId(topmost[0]);
      },
      { rootMargin: "-96px 0px -65% 0px" },
    );
    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  return (
    <nav
      aria-label={label}
      className="rounded-card border border-line bg-surface lg:border-0 lg:bg-transparent"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-start lg:hidden"
      >
        <ListTree className="size-4.5 text-primary" aria-hidden />
        <span className="flex-1 text-sm font-extrabold text-ink">{label}</span>
        <span className="sr-only">{open ? hideLabel : showLabel}</span>
        <ChevronDown
          className={cn(
            "size-4 text-muted transition-transform duration-300",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <p className="hidden items-center gap-2 pb-3 text-xs font-extrabold tracking-wide text-muted lg:flex">
        <ListTree className="size-4 text-primary" aria-hidden />
        {label}
      </p>
      <ol
        id={listId}
        className={cn(
          "flex-col gap-0.5 border-t border-line px-2 py-2 lg:flex lg:border-s lg:border-t-0 lg:px-0 lg:py-0",
          open ? "flex" : "hidden",
        )}
      >
        {headings.map((heading) => {
          const isActive = heading.id === activeId;
          return (
            <li key={heading.id} className="relative">
              {isActive && (
                <m.span
                  layoutId={markerId}
                  transition={springSnappy}
                  aria-hidden
                  className="absolute inset-y-1 -start-px hidden w-0.5 rounded-full bg-primary lg:block"
                />
              )}
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => {
                  setActiveId(heading.id);
                  setOpen(false);
                }}
                className={cn(
                  "block rounded-control py-2 text-label leading-6 transition-colors lg:rounded-none",
                  heading.depth > 2 ? "ps-7 lg:ps-8" : "ps-3 lg:ps-4",
                  "pe-3",
                  isActive
                    ? "bg-primary-soft font-extrabold text-primary lg:bg-transparent"
                    : "font-semibold text-body hover:text-ink",
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
