"use client";

import { Check } from "lucide-react";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

import { type RequestStep, requestSteps } from "../../schemas";

interface StepIndicatorProps {
  step: RequestStep;
  furthest: number;
  labels: Record<RequestStep, string>;
  progressLabel: string;
  progress: string;
  onSelect: (step: RequestStep) => void;
}

export function StepIndicator({
  step,
  furthest,
  labels,
  progressLabel,
  progress,
  onSelect,
}: StepIndicatorProps) {
  const locale = useLocale();
  const index = requestSteps.indexOf(step);
  const total = requestSteps.length;
  const status = fill(progress, {
    current: formatNumber(locale, index + 1),
    total: formatNumber(locale, total),
  });

  return (
    <nav aria-label={progressLabel} className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 sm:hidden">
        <p className="text-xs font-semibold text-muted">
          <span className="font-extrabold text-ink">{status}</span>
          <span aria-hidden className="mx-2 inline-block h-3 w-px translate-y-0.5 bg-line-strong" />
          {labels[step]}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-valuetext={`${status}: ${labels[step]}`}
        className="flex gap-1.5 sm:hidden"
      >
        {requestSteps.map((entry, position) => (
          <span key={entry} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <span
              className={cn(
                "block h-full rounded-full bg-primary transition-transform duration-700 ease-(--ease-out-expo) ltr:origin-left rtl:origin-right",
                position <= index ? "scale-x-100" : "scale-x-0",
              )}
            />
          </span>
        ))}
      </div>
      <ol className="hidden items-center sm:flex">
        {requestSteps.map((entry, position) => {
          const done = position < index;
          const current = position === index;
          const reachable = position <= furthest && !current;
          return (
            <li key={entry} className="flex flex-1 items-center gap-3 last:flex-none">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onSelect(entry)}
                aria-current={current ? "step" : undefined}
                className="group flex items-center gap-2.5 rounded-full py-1 pe-2 text-start disabled:cursor-default"
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold transition-colors duration-300",
                    current && "bg-primary text-on-primary shadow-primary",
                    done &&
                      "bg-primary-soft text-primary group-hover:bg-primary group-hover:text-on-primary",
                    !current && !done && "border border-line-strong bg-surface text-muted",
                  )}
                >
                  {done ? (
                    <Check className="size-4" strokeWidth={3} aria-hidden />
                  ) : (
                    formatNumber(locale, position + 1)
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm whitespace-nowrap",
                    current ? "font-extrabold text-ink" : "font-semibold text-muted",
                    reachable && "group-hover:text-primary",
                  )}
                >
                  {labels[entry]}
                </span>
              </button>
              {position < total - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 min-w-4 flex-1 rounded-full transition-colors duration-500",
                    position < index ? "bg-primary" : "bg-line",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
