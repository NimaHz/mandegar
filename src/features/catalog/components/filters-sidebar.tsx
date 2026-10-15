"use client";

import { LoaderCircle, SlidersHorizontal, Trash2 } from "lucide-react";
import { useId } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import type { ProductFacets } from "@/types/catalog";

import { catalogContent } from "../content";
import { activeFilters, clearedCatalogFilters } from "../filters";
import { useCatalogFilters } from "../use-catalog-filters";
import { FiltersPanel } from "./filters-panel";

interface FiltersSidebarProps {
  facets: ProductFacets;
  hideCategory?: boolean;
  className?: string;
}

export function FiltersSidebar({ facets, hideCategory = false, className }: FiltersSidebarProps) {
  const locale = useLocale();
  const { listing } = catalogContent[locale];
  const { filters, setFilters, isPending } = useCatalogFilters();
  const titleId = useId();
  const hasActive = activeFilters(filters, facets, hideCategory).length > 0;

  return (
    <aside
      aria-labelledby={titleId}
      className={cn(
        "sticky top-24 flex max-h-[calc(100dvh-7.5rem)] flex-col overflow-hidden panel shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3.5">
        <h2
          id={titleId}
          className="inline-flex items-center gap-2.5 text-lead font-extrabold text-ink"
        >
          <span className="icon-tile size-8">
            <SlidersHorizontal className="size-4" strokeWidth={2} aria-hidden />
          </span>
          {listing.filters}
          {isPending && (
            <>
              <LoaderCircle className="size-4 animate-spin text-muted" aria-hidden />
              <span className="sr-only">{listing.updating}</span>
            </>
          )}
        </h2>
        <button
          type="button"
          onClick={() => void setFilters(clearedCatalogFilters)}
          disabled={!hasActive}
          className="inline-flex shrink-0 items-center gap-1 rounded-control px-2 py-1 text-xs font-bold whitespace-nowrap text-primary transition-colors hover:bg-primary-soft disabled:pointer-events-none disabled:opacity-40"
        >
          <Trash2 className="size-3.5" aria-hidden />
          {listing.clearAll}
        </button>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4"
        data-lenis-prevent
      >
        <FiltersPanel facets={facets} hideCategory={hideCategory} />
      </div>
    </aside>
  );
}
