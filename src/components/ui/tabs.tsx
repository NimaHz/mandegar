"use client";

import { m } from "motion/react";
import { type KeyboardEvent, useId } from "react";

import { springSnappy } from "@/components/motion/easing";
import { cn } from "@/lib/cn";
import { isRtl } from "@/lib/dom";

interface TabItem<TValue extends string> {
  value: TValue;
  label: string;
  count?: string;
}

interface TabsProps<TValue extends string> {
  items: readonly TabItem<TValue>[];
  value: TValue;
  onChange: (value: TValue) => void;
  label: string;
  idPrefix: string;
  className?: string;
}

export const tabId = (prefix: string, value: string) => `${prefix}-tab-${value}`;
export const panelId = (prefix: string, value: string) => `${prefix}-panel-${value}`;

export function Tabs<TValue extends string>({
  items,
  value,
  onChange,
  label,
  idPrefix,
  className,
}: TabsProps<TValue>) {
  const layoutId = useId();

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.value === value);
    const forward = (index + 1) % items.length;
    const backward = (index - 1 + items.length) % items.length;
    const rtl = isRtl(event.currentTarget);
    const targets: Partial<Record<string, number>> = {
      ArrowLeft: rtl ? forward : backward,
      ArrowRight: rtl ? backward : forward,
      Home: 0,
      End: items.length - 1,
    };
    const target = targets[event.key];
    if (target === undefined) return;
    event.preventDefault();
    const next = items[target];
    if (!next) return;
    onChange(next.value);
    document.getElementById(tabId(idPrefix, next.value))?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={handleKeyDown}
      className={cn(
        "scrollbar-none inline-flex max-w-full gap-1 overflow-x-auto rounded-field border border-line-strong bg-surface p-1",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.value === value;
        return (
          <button
            key={item.value}
            id={tabId(idPrefix, item.value)}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId(idPrefix, item.value)}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative isolate inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm transition-colors duration-200 sm:h-11 sm:px-6 sm:text-lead",
              isActive ? "font-extrabold text-on-inverse" : "font-bold text-ink hover:text-primary",
            )}
          >
            {isActive && (
              <m.span
                layoutId={layoutId}
                transition={springSnappy}
                className="absolute inset-0 -z-10 rounded-lg bg-inverse"
              />
            )}
            {item.label}
            {item.count && (
              <span
                className={cn(
                  "grid min-w-5 place-items-center rounded-full px-1.5 text-caption font-extrabold",
                  isActive ? "bg-on-inverse text-inverse" : "bg-primary text-on-primary",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
