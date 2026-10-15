"use client";

import { LoaderCircle, Search, X } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { useLocale } from "@/i18n/locale-provider";

import { catalogContent } from "../content";
import { useCatalogFilters } from "../use-catalog-filters";

export function CatalogSearch() {
  const locale = useLocale();
  const { listing } = catalogContent[locale];
  const { filters, setFilters, isPending } = useCatalogFilters();
  const [query, setQuery] = useState(filters.q);
  const [syncedQuery, setSyncedQuery] = useState(filters.q);
  const inputId = useId();

  if (syncedQuery !== filters.q) {
    setSyncedQuery(filters.q);
    setQuery(filters.q);
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void setFilters({ q: query.trim() || null, page: null });
  };

  const onClear = () => {
    setQuery("");
    if (filters.q) void setFilters({ q: null, page: null });
  };

  return (
    <form role="search" onSubmit={onSubmit} className="flex w-full max-w-2xl gap-2">
      <div className="relative flex h-13 min-w-0 flex-1 items-center gap-2.5 field-shell ps-4 pe-2 lg:h-14">
        <Search className="size-5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden />
        <label htmlFor={inputId} className="sr-only">
          {listing.searchLabel}
        </label>
        <input
          id={inputId}
          type="search"
          name="q"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={listing.searchPlaceholder}
          enterKeyHint="search"
          autoComplete="off"
          className="h-full min-w-0 flex-1 bg-transparent text-lead text-ink outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={onClear}
            aria-label={listing.searchClear}
            className="icon-btn size-8 rounded-full"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="inline-flex h-13 shrink-0 items-center justify-center gap-2 rounded-field bg-primary px-5 text-sm font-bold text-on-primary transition-[background-color,box-shadow] hover:bg-primary-strong hover:shadow-primary sm:px-7 lg:h-14"
      >
        {isPending ? (
          <LoaderCircle className="size-4.5 animate-spin" aria-hidden />
        ) : (
          <Search className="size-4.5 sm:hidden" aria-hidden />
        )}
        <span className="max-sm:sr-only">{listing.searchSubmit}</span>
      </button>
    </form>
  );
}
