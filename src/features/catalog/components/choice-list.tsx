"use client";

import { m } from "motion/react";
import { type ReactNode, useId } from "react";

import { springSnappy } from "@/components/motion/easing";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

import { pluralForm, type PluralForms } from "../plural";

export interface Choice {
  value: string;
  label: string;
  count: number;
  adornment?: ReactNode;
  hideLabel?: boolean;
}

interface ChoiceListProps {
  label: string;
  unit: PluralForms;
  choices: Choice[];
  value: string | null;
  onChange: (value: string | null) => void;
}

export function ChoiceList({ label, unit, choices, value, onChange }: ChoiceListProps) {
  const locale = useLocale();
  const layoutId = useId();

  return (
    <div role="group" aria-label={label}>
      <ul className="flex flex-col gap-0.5">
        {choices.map((choice) => {
          const isActive = choice.value === value;
          const isEmpty = choice.count === 0 && !isActive;
          return (
            <li key={choice.value}>
              <button
                type="button"
                aria-pressed={isActive}
                disabled={isEmpty}
                onClick={() => onChange(isActive ? null : choice.value)}
                className={cn(
                  "group relative isolate flex h-10 w-full items-center gap-2.5 rounded-control px-2.5 text-start text-label transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45",
                  isActive
                    ? "font-bold text-primary"
                    : "font-semibold text-body enabled:hover:bg-sunken enabled:hover:text-ink",
                )}
              >
                {isActive && (
                  <m.span
                    layoutId={layoutId}
                    transition={springSnappy}
                    className="absolute inset-0 -z-10 rounded-control bg-primary-soft"
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded-full border-[1.5px] transition-colors duration-200",
                    isActive
                      ? "border-primary"
                      : "border-line-strong group-enabled:group-hover:border-muted",
                  )}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full bg-primary transition-transform duration-200",
                      isActive ? "scale-100" : "scale-0",
                    )}
                  />
                </span>
                {choice.adornment}
                <span className={cn("min-w-0 flex-1 truncate", choice.hideLabel && "sr-only")}>
                  {choice.label}
                </span>
                {choice.hideLabel && <span aria-hidden className="flex-1" />}
                <span
                  className={cn(
                    "shrink-0 text-xs font-semibold tabular-nums",
                    isActive ? "text-primary" : "text-muted",
                  )}
                >
                  {formatNumber(locale, choice.count)}
                  <span className="sr-only"> {pluralForm(locale, choice.count, unit)}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
