"use client";

import { ArrowDownUp, LoaderCircle, Search, X } from "lucide-react";
import { parseAsString, useQueryStates } from "nuqs";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { useSharedTransition } from "@/components/providers/transition-provider";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/cn";
import type { Option } from "@/types/common";

import { adminContent } from "../../content";

const { common } = adminContent;

export interface ToolbarFilter {
  key: string;
  label: string;
  options: readonly Option[];
  allLabel?: string;
}

interface ListToolbarProps {
  searchPlaceholder?: string;
  filters?: readonly ToolbarFilter[];
  externalFilters?: readonly string[];
  sort?: readonly Option[];
  children?: ReactNode;
  className?: string;
}

const SEARCH_DEBOUNCE_MS = 350;
const SORT_KEY = "sort";

export function ListToolbar({
  searchPlaceholder,
  filters = [],
  externalFilters = [],
  sort,
  children,
  className,
}: ListToolbarProps) {
  const { isPending, startTransition } = useSharedTransition();
  const filterKeys = [...filters.map((filter) => filter.key), ...externalFilters];
  const parsers = Object.fromEntries(
    ["q", "page", SORT_KEY, ...filterKeys].map((key) => [key, parseAsString]),
  );
  const [state, setState] = useQueryStates(parsers, {
    shallow: false,
    scroll: false,
    history: "replace",
    startTransition,
  });
  const [query, setQuery] = useState(state.q ?? "");
  const timer = useRef<number | undefined>(undefined);
  const active = filterKeys.some((key) => state[key]) || Boolean(state.q);
  const defaultSort = sort?.[0]?.value;
  const sortValue = (sort?.find((option) => option.value === state.sort) ?? sort?.[0])?.value;

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSearch = (value: string) => {
    setQuery(value);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void setState({ q: value.trim() || null, page: null });
    }, SEARCH_DEBOUNCE_MS);
  };

  const clear = () => {
    window.clearTimeout(timer.current);
    setQuery("");
    void setState(
      Object.fromEntries(
        Object.keys(parsers)
          .filter((key) => key !== SORT_KEY)
          .map((key) => [key, null]),
      ),
    );
  };

  return (
    <div className={cn("flex flex-col gap-2 lg:flex-row lg:items-start", className)}>
      <label className="relative flex-1 lg:max-w-sm lg:min-w-72">
        <span className="sr-only">{common.search}</span>
        <Search
          className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-11 w-full rounded-control border border-line-strong bg-raised ps-10 pe-10 text-sm text-ink transition-[border-color,box-shadow] outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
        />
        {isPending && (
          <LoaderCircle
            className="absolute end-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary"
            aria-hidden
          />
        )}
      </label>
      {(filters.length > 0 || sort || children) && (
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center lg:flex-[2]">
          {filters.map((filter) => (
            <label key={filter.key} className="min-w-0 sm:w-44">
              <span className="sr-only">{filter.label}</span>
              <Select
                options={filter.options}
                placeholder={filter.allLabel ?? `${filter.label}: ${common.all}`}
                value={state[filter.key] ?? ""}
                onChange={(event) =>
                  void setState({ [filter.key]: event.target.value || null, page: null })
                }
                className={cn(state[filter.key] && "border-primary/60 bg-primary-soft/40")}
              />
            </label>
          ))}
          {children}
          {active && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex h-11 items-center gap-1.5 rounded-control px-3 text-label font-bold text-muted transition-colors hover:bg-sunken hover:text-ink"
            >
              <X className="size-4" aria-hidden />
              {common.clearFilters}
            </button>
          )}
          {sort && defaultSort && (
            <label className="min-w-0 sm:ms-auto sm:w-44">
              <span className="sr-only">{common.sort}</span>
              <Select
                icon={ArrowDownUp}
                options={sort}
                value={sortValue}
                onChange={(event) =>
                  void setState({
                    [SORT_KEY]: event.target.value === defaultSort ? null : event.target.value,
                    page: null,
                  })
                }
                className={cn(sortValue !== defaultSort && "border-primary/60 bg-primary-soft/40")}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
