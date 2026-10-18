"use client";

import { Check, Search, X } from "lucide-react";
import { useId, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import { includesQuery } from "@/lib/persian";
import type { Option } from "@/types/common";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { useReadOnly } from "./read-only";
import { useFieldError } from "./use-field-error";

interface MultiSelectProps {
  name: string;
  label: string;
  options: readonly Option[];
  hint?: string;
  max?: number;
  exclude?: string;
}

const copy = adminContent.multiSelect;

const asIds = (value: unknown) =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

export function MultiSelect({ name, label, options, hint, max, exclude }: MultiSelectProps) {
  const id = useId();
  const { control } = useFormContext();
  const error = useFieldError(name);
  const [query, setQuery] = useState("");
  const locked = useReadOnly();
  const available = options.filter((option) => option.value !== exclude);
  const visible = available.filter((option) => includesQuery(query, option.label));

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const selected = asIds(field.value);
        const full = max !== undefined && selected.length >= max;
        const toggle = (value: string) =>
          field.onChange(
            selected.includes(value)
              ? selected.filter((item) => item !== value)
              : [...selected, value],
          );
        return (
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span id={`${id}-label`} className="text-label font-bold text-ink">
                {label}
              </span>
              <span className="text-caption font-bold text-muted" role="status">
                {fill(copy.selected, { count: faNumber(selected.length) })}
                {max !== undefined && ` / ${faNumber(max)}`}
              </span>
            </div>
            {selected.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label={copy.selectedList}>
                {selected.map((value) => {
                  const option = options.find((item) => item.value === value);
                  return (
                    <li key={value}>
                      <button
                        type="button"
                        onClick={() => toggle(value)}
                        disabled={locked}
                        aria-label={fill(copy.remove, { label: option?.label ?? value })}
                        className="inline-flex h-7 max-w-64 items-center gap-1 rounded-full bg-primary-soft ps-3 pe-1.5 text-xs font-bold text-primary transition-colors hover:bg-danger-soft hover:text-danger disabled:pointer-events-none"
                      >
                        <span className="truncate">{option?.label ?? value}</span>
                        <X className="size-3.5 shrink-0" aria-hidden />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
            <div
              className={cn(
                "overflow-hidden rounded-field border bg-raised",
                error ? "border-danger" : "border-line-strong",
              )}
            >
              <label className="relative block border-b border-line">
                <span className="sr-only">{adminContent.common.search}</span>
                <Search
                  className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={copy.search}
                  className="h-10 w-full bg-transparent ps-9 pe-3 text-sm text-ink outline-none"
                />
              </label>
              <ul
                role="listbox"
                aria-multiselectable="true"
                aria-labelledby={`${id}-label`}
                className="max-h-56 overflow-y-auto overscroll-contain p-1"
              >
                {visible.length === 0 ? (
                  <li className="px-3 py-4 text-center text-xs text-muted">
                    {adminContent.common.noResults}
                  </li>
                ) : (
                  visible.map((option) => {
                    const checked = selected.includes(option.value);
                    return (
                      <li key={option.value} role="option" aria-selected={checked}>
                        <button
                          type="button"
                          onClick={() => toggle(option.value)}
                          disabled={locked || (!checked && full)}
                          className={cn(
                            "flex min-h-9 w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-start text-sm transition-colors disabled:opacity-40",
                            checked ? "font-bold text-ink" : "text-body hover:bg-sunken",
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn(
                              "grid size-4.5 shrink-0 place-items-center rounded-md border transition-colors",
                              checked
                                ? "border-primary bg-primary text-on-primary"
                                : "border-line-strong",
                            )}
                          >
                            {checked && <Check className="size-3" strokeWidth={3.2} />}
                          </span>
                          <span className="min-w-0 truncate">{option.label}</span>
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
            {(error || hint) && (
              <p className={cn("text-xs", error ? "font-semibold text-danger" : "text-muted")}>
                {error ?? hint}
              </p>
            )}
          </div>
        );
      }}
    />
  );
}
