"use client";

import { Building2, Gauge, LayoutGrid, type LucideIcon } from "lucide-react";
import { type ReactNode, useId } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { energyClasses, type ProductFacets } from "@/types/catalog";

import { catalogContent } from "../content";
import { energyChoices, isEnergyClass } from "../filters";
import { useCatalogFilters } from "../use-catalog-filters";
import { ChoiceList } from "./choice-list";
import { EnergyBadge } from "./energy-badge";

interface FiltersPanelProps {
  facets: ProductFacets;
  hideCategory?: boolean;
}

export function FiltersPanel({ facets, hideCategory = false }: FiltersPanelProps) {
  const locale = useLocale();
  const { listing } = catalogContent[locale];
  const { filters, setFilters } = useCatalogFilters();
  const energyFacets = energyChoices(facets.energyClasses);

  return (
    <div className="flex flex-col divide-y divide-line">
      {!hideCategory && facets.categories.length > 0 && (
        <FilterGroup title={listing.groups.category} icon={LayoutGrid}>
          <ChoiceList
            label={listing.groups.category}
            unit={listing.modelsUnit}
            choices={facets.categories}
            value={filters.category}
            onChange={(category) => void setFilters({ category, page: null })}
          />
        </FilterGroup>
      )}
      {facets.brands.length > 1 && (
        <FilterGroup title={listing.groups.brand} icon={Building2}>
          <ChoiceList
            label={listing.groups.brand}
            unit={listing.modelsUnit}
            choices={facets.brands}
            value={filters.brand}
            onChange={(brand) => void setFilters({ brand, page: null })}
          />
        </FilterGroup>
      )}
      {energyFacets.length > 0 && (
        <FilterGroup
          title={listing.groups.energy}
          icon={Gauge}
          hint={
            <>
              {listing.energyHint}{" "}
              <bdi dir="ltr" className="font-code font-bold text-success">
                {energyClasses[0]}
              </bdi>
            </>
          }
        >
          <ChoiceList
            label={listing.groups.energy}
            unit={listing.modelsUnit}
            choices={energyFacets.map((facet) => ({
              ...facet,
              hideLabel: true,
              adornment: <EnergyBadge value={facet.value} size="md" />,
            }))}
            value={filters.energy}
            onChange={(energy) =>
              void setFilters({ energy: isEnergyClass(energy) ? energy : null, page: null })
            }
          />
        </FilterGroup>
      )}
    </div>
  );
}

interface FilterGroupProps {
  title: string;
  icon: LucideIcon;
  hint?: ReactNode;
  children: ReactNode;
}

function FilterGroup({ title, icon: Icon, hint, children }: FilterGroupProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
      <div className="flex flex-col gap-0.5 px-1">
        <h3 id={titleId} className="inline-flex items-center gap-2 text-sm font-extrabold text-ink">
          <Icon className="size-4 text-muted" strokeWidth={1.9} aria-hidden />
          {title}
        </h3>
        {hint && <p className="ps-6 text-caption text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}
