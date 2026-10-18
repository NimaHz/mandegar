"use client";

import * as m from "motion/react-m";
import { useEffect, useId, useRef, useState } from "react";

import { springSnappy } from "@/components/motion/easing";
import { cn } from "@/lib/cn";
import { scrollBehavior } from "@/lib/dom";

interface SectionNavItem {
  id: string;
  label: string;
}

interface SectionNavProps {
  items: SectionNavItem[];
  label: string;
}

const SPY_OFFSET = 160;
const IDLE_FALLBACK_MS = 200;

const onIdle = (callback: () => void) => {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback);
    return () => window.cancelIdleCallback(handle);
  }
  const handle = window.setTimeout(callback, IDLE_FALLBACK_MS);
  return () => window.clearTimeout(handle);
};

const afterNextFrame = (callback: () => void) => {
  let inner = 0;
  const outer = window.requestAnimationFrame(() => {
    inner = window.requestAnimationFrame(callback);
  });
  return () => {
    window.cancelAnimationFrame(outer);
    window.cancelAnimationFrame(inner);
  };
};

function useRememberedSectionSizes(items: SectionNavItem[]) {
  useEffect(() => {
    const sections = items.flatMap((item) => document.getElementById(item.id) ?? []);
    let cancel = () => {};
    const renderNext = () => {
      const section = sections.shift();
      if (!section) return;
      section.style.contentVisibility = "visible";
      cancel = afterNextFrame(() => {
        section.style.contentVisibility = "";
        cancel = onIdle(renderNext);
      });
    };
    cancel = onIdle(renderNext);
    return () => cancel();
  }, [items]);
}

export function SectionNav({ items, label }: SectionNavProps) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const layoutId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  useRememberedSectionSizes(items);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      const passed = items.filter((item) => {
        const element = document.getElementById(item.id);
        return element ? element.getBoundingClientRect().top <= SPY_OFFSET : false;
      });
      const current = atBottom ? items.at(-1) : (passed.at(-1) ?? items[0]);
      if (current) setActive(current.id);
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [items]);

  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-section="${active}"]`);
    if (!list || !link) return;
    const listRect = list.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const offset = linkRect.left + linkRect.width / 2 - (listRect.left + listRect.width / 2);
    list.scrollBy({ left: offset, behavior: scrollBehavior() });
  }, [active]);

  return (
    <nav
      aria-label={label}
      className="sticky top-16 z-20 border-y border-line bg-canvas/90 backdrop-blur-xl lg:top-18"
    >
      <div className="container-page">
        <ul
          ref={listRef}
          className="-mx-1 scrollbar-none flex gap-1 overflow-x-auto px-1 py-2 max-sm:mask-x-from-90% max-sm:mask-x-to-100%"
        >
          {items.map((item) => {
            const isActive = item.id === active;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  data-section={item.id}
                  aria-current={isActive ? "location" : undefined}
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "relative isolate inline-flex h-10 items-center rounded-full px-4 text-sm whitespace-nowrap transition-colors duration-200",
                    isActive
                      ? "font-extrabold text-on-inverse"
                      : "font-semibold text-body hover:bg-sunken hover:text-ink",
                  )}
                >
                  {isActive && (
                    <m.span
                      layoutId={layoutId}
                      transition={springSnappy}
                      className="absolute inset-0 -z-10 rounded-full bg-inverse"
                    />
                  )}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
