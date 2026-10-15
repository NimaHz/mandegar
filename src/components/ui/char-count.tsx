"use client";

import { fill } from "@/i18n/fill";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

export interface CharLimits {
  min: number;
  max: number;
}

interface CharCountProps {
  value: string;
  limits: CharLimits;
}

export function CharCount({ value, limits }: CharCountProps) {
  const locale = useLocale();
  const { ui } = useDictionary();
  const length = value.trim().length;
  const count = formatNumber(locale, length);
  const max = formatNumber(locale, limits.max);
  const state =
    length === 0 ? "empty" : length < limits.min ? "short" : length > limits.max ? "long" : "good";
  const message = {
    empty: fill(ui.charCountEmpty, { min: formatNumber(locale, limits.min), max }),
    short: fill(ui.charCountShort, { count: formatNumber(locale, limits.min - length) }),
    good: ui.charCountGood,
    long: ui.charCountLong,
  }[state];

  return (
    <span className="flex items-center justify-between gap-3">
      <span
        className={cn(
          "font-semibold",
          state === "good" && "text-success",
          state === "short" && "text-warning",
          state === "long" && "text-danger",
        )}
      >
        {message}
      </span>
      <span aria-hidden className="shrink-0 tabular-nums">
        {count}/{max}
      </span>
      <span className="sr-only">{fill(ui.charCount, { count, max })}</span>
    </span>
  );
}
