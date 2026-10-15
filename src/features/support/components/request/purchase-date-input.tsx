"use client";

import { CalendarDays, X } from "lucide-react";
import { useId, useState } from "react";

import { Select } from "@/components/ui/select";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { currentJalaliYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";

import { isoToJalali, jalaliMonthLength, jalaliToIso } from "../../jalali";
import { todayIso } from "../../schemas";

interface PurchaseDateLabels {
  label: string;
  optional: string;
  hint: string;
  year: string;
  month: string;
  day: string;
  clear: string;
  months: string[];
}

interface PurchaseDateInputProps {
  locale: Locale;
  value: string;
  onChange: (value: string) => void;
  labels: PurchaseDateLabels;
  error?: string | undefined;
}

const YEARS_BACK = 20;

const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);

function JalaliSelects({ locale, value, onChange, labels, error }: PurchaseDateInputProps) {
  const initial = value ? isoToJalali(value) : null;
  const [parts, setParts] = useState({
    year: initial ? String(initial.year) : "",
    month: initial ? String(initial.month) : "",
    day: initial ? String(initial.day) : "",
  });
  const thisYear = currentJalaliYear();
  const days = jalaliMonthLength(Number(parts.year) || thisYear, Number(parts.month) || 1);
  const plain = (number: number) => formatNumber(locale, number, { useGrouping: false });

  const update = (key: keyof typeof parts, next: string) => {
    const merged = { ...parts, [key]: next };
    setParts(merged);
    if (!merged.year && !merged.month && !merged.day) return onChange("");
    if (!merged.year || !merged.month || !merged.day) return onChange("incomplete");
    onChange(
      jalaliToIso({
        year: Number(merged.year),
        month: Number(merged.month),
        day: Number(merged.day),
      }) ?? "invalid",
    );
  };

  const selectClass = cn(error && "border-danger");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
      <Select
        aria-label={labels.day}
        value={parts.day}
        onChange={(event) => update("day", event.target.value)}
        placeholder={labels.day}
        options={range(1, days).map((day) => ({ value: String(day), label: plain(day) }))}
        className={selectClass}
      />
      <Select
        aria-label={labels.month}
        value={parts.month}
        onChange={(event) => update("month", event.target.value)}
        placeholder={labels.month}
        options={labels.months.map((month, index) => ({ value: String(index + 1), label: month }))}
        className={selectClass}
      />
      <Select
        aria-label={labels.year}
        value={parts.year}
        onChange={(event) => update("year", event.target.value)}
        placeholder={labels.year}
        options={range(thisYear - YEARS_BACK, thisYear)
          .toReversed()
          .map((year) => ({ value: String(year), label: plain(year) }))}
        className={selectClass}
      />
    </div>
  );
}

export function PurchaseDateInput(props: PurchaseDateInputProps) {
  const { locale, value, onChange, labels, error } = props;
  const id = useId();
  const messageId = `${id}-message`;
  const [version, setVersion] = useState(0);

  return (
    <fieldset aria-describedby={messageId} className="flex flex-col gap-1.5">
      <legend className="mb-1.5 flex w-full items-center justify-between gap-3 text-label font-bold text-ink">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 text-muted" aria-hidden />
          {labels.label}
          <span className="text-caption font-semibold text-muted">({labels.optional})</span>
        </span>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setVersion((count) => count + 1);
            }}
            className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-caption font-bold text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <X className="size-3.5" aria-hidden />
            {labels.clear}
          </button>
        )}
      </legend>
      {locale === "fa" ? (
        <JalaliSelects key={version} {...props} />
      ) : (
        <input
          id={id}
          type="date"
          aria-label={labels.label}
          value={/^\d{4}-\d{2}-\d{2}$/.test(value) ? value : ""}
          max={todayIso()}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? true : undefined}
          className={cn(
            "h-11 w-full rounded-control border bg-raised px-3.5 text-sm font-semibold text-ink transition-[border-color,box-shadow] outline-none focus:border-primary focus:ring-3 focus:ring-primary/15",
            error ? "border-danger" : "border-line-strong",
          )}
        />
      )}
      <p
        id={messageId}
        className={cn("text-xs", error ? "font-semibold text-danger" : "text-muted")}
      >
        {error ?? labels.hint}
      </p>
    </fieldset>
  );
}
