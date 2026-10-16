"use client";

import { Check, PackageSearch, Search, X } from "lucide-react";
import { type KeyboardEvent, type Ref, useId, useImperativeHandle, useRef, useState } from "react";

import { cn } from "@/lib/cn";
import { toSearchKey } from "@/lib/persian";
import type { ModelOption } from "@/types/catalog";

interface ModelPickerLabels {
  label: string;
  optional: string;
  placeholder: string;
  empty: string;
  clear: string;
  hint: string;
}

interface ModelPickerProps {
  ref?: Ref<{ focus: () => void }>;
  models: ModelOption[];
  value: string;
  onChange: (slug: string) => void;
  labels: ModelPickerLabels;
  error?: string | undefined;
}

const MAX_RESULTS = 40;

const searchKey = (value: string) => toSearchKey(value).replace(/[^\p{L}\p{N}]/gu, "");

const matches = (query: string, model: ModelOption) => {
  const needle = searchKey(query);
  return (
    !needle ||
    [model.name, model.modelCode, model.category].some((field) => searchKey(field).includes(needle))
  );
};

export function ModelPicker({ ref, models, value, onChange, labels, error }: ModelPickerProps) {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const listId = `${baseId}-list`;
  const messageId = `${baseId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), []);

  const selected = models.find((model) => model.slug === value) ?? null;
  const results = models.filter((model) => matches(query, model)).slice(0, MAX_RESULTS);
  const activeIndex = Math.min(active, Math.max(0, results.length - 1));

  const choose = (model: ModelOption) => {
    onChange(model.slug);
    setQuery("");
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((activeIndex + step + results.length) % Math.max(1, results.length));
      return;
    }
    if (event.key === "Enter" && open) {
      const model = results[activeIndex];
      if (model) {
        event.preventDefault();
        choose(model);
      }
      return;
    }
    if (event.key === "Escape") setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-label font-bold text-ink">
        {labels.label}
        <span className="ms-1.5 text-caption font-semibold text-muted">({labels.optional})</span>
      </label>

      {selected ? (
        <div
          className={cn(
            "flex items-center gap-3 rounded-field border bg-raised p-2.5 ps-3 shadow-field",
            error ? "border-danger" : "border-primary",
          )}
        >
          <span className="icon-tile size-10">
            <Check className="size-4.5" strokeWidth={2.6} aria-hidden />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-bold text-ink">{selected.name}</span>
            <span className="text-caption text-muted">
              <bdi dir="ltr" className="font-code font-semibold">
                {selected.modelCode}
              </bdi>
              <span aria-hidden> · </span>
              {selected.category}
            </span>
          </span>
          <button
            type="button"
            onClick={clear}
            aria-label={labels.clear}
            className="icon-btn size-9 hover:bg-chip"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      ) : (
        <div className="relative">
          <Search
            className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              open && results[activeIndex] ? `${listId}-${activeIndex}` : undefined
            }
            aria-invalid={error ? true : undefined}
            aria-describedby={messageId}
            autoComplete="off"
            value={query}
            placeholder={labels.placeholder}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onKeyDown={onKeyDown}
            className={cn(
              "h-12 w-full rounded-field border bg-raised ps-10 pe-3.5 text-lead text-ink transition-[border-color,box-shadow] duration-200 outline-none focus:border-primary focus:ring-3 focus:ring-primary/15",
              error ? "border-danger" : "border-line-strong",
            )}
          />
          {open && (
            <ul
              id={listId}
              role="listbox"
              aria-label={labels.label}
              data-lenis-prevent
              className="absolute inset-x-0 top-full z-30 mt-2 max-h-72 overflow-y-auto overscroll-contain rounded-field border border-line bg-raised p-1.5 shadow-lift"
            >
              {results.length === 0 ? (
                <li className="flex items-center gap-2 px-3 py-4 text-sm text-muted">
                  <PackageSearch className="size-4.5" aria-hidden />
                  {labels.empty}
                </li>
              ) : (
                results.map((model, index) => (
                  <li
                    key={model.slug}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(model)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-3 rounded-control px-3 py-2.5",
                      index === activeIndex ? "bg-primary-soft" : "hover:bg-surface",
                    )}
                  >
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-semibold text-ink">{model.name}</span>
                      <span className="text-caption text-muted">{model.category}</span>
                    </span>
                    <bdi dir="ltr" className="shrink-0 font-code text-xs font-bold text-primary">
                      {model.modelCode}
                    </bdi>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}
      <p
        id={messageId}
        className={cn("text-xs", error ? "font-semibold text-danger" : "text-muted")}
      >
        {error ?? labels.hint}
      </p>
    </div>
  );
}
