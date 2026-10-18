"use client";

import { ArrowDownWideNarrow, LoaderCircle, SlidersHorizontal } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { pluralForm, pluralize } from "@/i18n/plural";
import { formatNumber } from "@/lib/format";
import { type ProductFacets, productSorts } from "@/types/catalog";

import { catalogContent } from "../content";
import { activeFilters, clearedCatalogFilters } from "../filters";
import { useCatalogFilters } from "../use-catalog-filters";
import { FilterChip } from "./filter-chip";
import { FiltersPanel } from "./filters-panel";

interface CatalogToolbarProps {
  total: number;
  facets: ProductFacets;
  hideCategory?: boolean;
}

const isSort = (value: string) => productSorts.find((sort) => sort === value) ?? null;

export function CatalogToolbar({ total, facets, hideCategory = false }: CatalogToolbarProps) {
  const locale = useLocale();
  const { listing } = catalogContent[locale];
  const { filters, setFilters, isPending } = useCatalogFilters();
  const [sheetOpen, setSheetOpen] = useState(false);
  const sortId = useId();
  const chips = activeFilters(filters, facets, hideCategory);
  const panelCount = chips.filter((chip) => chip.key !== "q").length;
  const count = formatNumber(locale, total);

  return (
    <div className="flex flex-col gap-3 card p-3 shadow-card sm:p-4">
      <div className="flex flex-wrap items-center gap-3">
        <p
          role="status"
          className="inline-flex shrink-0 items-center gap-2 text-label font-semibold whitespace-nowrap text-muted"
        >
          {isPending ? (
            <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
          ) : (
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-success" />
          )}
          <span>
            {total === 0 ? (
              listing.countEmpty
            ) : (
              <>
                <span className="font-display text-base font-black text-ink">{count}</span>{" "}
                {pluralForm(locale, total, listing.modelsUnit)}
              </>
            )}
          </span>
        </p>

        <div className="flex flex-1 items-center justify-end gap-2">
          <label
            htmlFor={sortId}
            className="inline-flex items-center gap-1.5 text-label font-bold text-ink max-sm:sr-only"
          >
            <ArrowDownWideNarrow className="size-4 text-muted" aria-hidden />
            {listing.sortLabel}
          </label>
          <div className="min-w-36 flex-1 sm:flex-none">
            <Select
              id={sortId}
              className="h-10"
              value={filters.sort}
              options={productSorts.map((sort) => ({ value: sort, label: listing.sorts[sort] }))}
              onChange={(event) => {
                const sort = isSort(event.target.value);
                void setFilters({ sort: sort === "featured" ? null : sort, page: null });
              }}
            />
          </div>
          <Button
            variant="line"
            size="sm"
            className="relative h-10 lg:hidden"
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
            onClick={() => setSheetOpen(true)}
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {listing.filters}
            {panelCount > 0 && (
              <span className="grid size-5 place-items-center rounded-full bg-primary text-caption font-extrabold text-on-primary">
                {formatNumber(locale, panelCount)}
                <span className="sr-only">
                  {" "}
                  {pluralize(locale, panelCount, listing.filtersActive)}
                </span>
              </span>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <m.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <ul
              aria-label={listing.activeFilters}
              className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3"
            >
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((chip) => (
                  <FilterChip
                    key={chip.key}
                    label={chip.label}
                    removeLabel={fill(listing.removeFilter, { label: chip.label })}
                    onRemove={() => void setFilters({ ...chip.reset, page: null })}
                  />
                ))}
              </AnimatePresence>
              {chips.length > 1 && (
                <li>
                  <button
                    type="button"
                    onClick={() => void setFilters(clearedCatalogFilters)}
                    className="h-8 rounded-control px-2 text-xs font-bold text-primary hover:underline"
                  >
                    {listing.clearAll}
                  </button>
                </li>
              )}
            </ul>
          </m.div>
        )}
      </AnimatePresence>

      <Sheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={listing.filtersTitle}
        footer={
          <Button block onClick={() => setSheetOpen(false)}>
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" aria-hidden />
            ) : (
              pluralize(locale, total, listing.showResults)
            )}
          </Button>
        }
      >
        <FiltersPanel facets={facets} hideCategory={hideCategory} />
      </Sheet>
    </div>
  );
}
