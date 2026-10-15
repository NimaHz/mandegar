import {
  type EnergyClass,
  energyClasses,
  type FacetCount,
  type ProductFacets,
  type ProductsQuery,
} from "@/types/catalog";

import { type CatalogFilters, serializeCatalogSearchParams } from "./search-params";

export type CatalogFilterKey = "q" | "category" | "brand" | "energy";

export interface ActiveFilter {
  key: CatalogFilterKey;
  label: string;
  reset: { [Key in CatalogFilterKey]?: null };
}

const chip = (key: CatalogFilterKey, label: string): ActiveFilter => ({
  key,
  label,
  reset: { [key]: null },
});

const labelFrom = (facets: FacetCount[], value: string) =>
  facets.find((facet) => facet.value === value)?.label ?? value;

export const activeFilters = (
  filters: CatalogFilters,
  facets: ProductFacets,
  fixedCategory: boolean,
): ActiveFilter[] => {
  const chips: ActiveFilter[] = [];
  if (filters.q) chips.push(chip("q", `«${filters.q}»`));
  if (filters.category && !fixedCategory)
    chips.push(chip("category", labelFrom(facets.categories, filters.category)));
  if (filters.brand) chips.push(chip("brand", labelFrom(facets.brands, filters.brand)));
  if (filters.energy) chips.push(chip("energy", filters.energy));
  return chips;
};

export const clearedCatalogFilters = {
  q: null,
  category: null,
  brand: null,
  energy: null,
  page: null,
} satisfies Record<CatalogFilterKey | "page", null>;

export const toProductsQuery = (
  filters: CatalogFilters,
  category: string | null = filters.category,
): ProductsQuery => ({
  q: filters.q.trim(),
  category,
  brand: filters.brand,
  energy: filters.energy,
  sort: filters.sort,
  page: Math.max(1, filters.page),
});

export const isRefined = (filters: CatalogFilters) =>
  Boolean(filters.q.trim() || filters.brand || filters.energy) || filters.sort !== "featured";

export const listingPath = (path: string, filters: CatalogFilters) =>
  isRefined(filters)
    ? path
    : `${path}${serializeCatalogSearchParams({ page: filters.page > 1 ? filters.page : null })}`;

export const facetsFromProducts = (
  products: { brand: { slug: string; name: string }; energyClass: string | null }[],
): Pick<ProductFacets, "brands" | "energyClasses"> => {
  const tally = (entries: { value: string; label: string }[]) => {
    const totals = new Map<string, FacetCount>();
    for (const entry of entries) {
      const current = totals.get(entry.value);
      totals.set(entry.value, { ...entry, count: (current?.count ?? 0) + 1 });
    }
    return [...totals.values()];
  };
  return {
    brands: tally(products.map(({ brand }) => ({ value: brand.slug, label: brand.name }))),
    energyClasses: tally(
      products.flatMap(({ energyClass }) =>
        energyClass ? [{ value: energyClass, label: energyClass }] : [],
      ),
    ),
  };
};

export const isEnergyClass = (value: string | null): value is EnergyClass =>
  energyClasses.some((entry) => entry === value);

export const energyChoices = (facets: FacetCount[]) =>
  facets
    .flatMap((facet) => (isEnergyClass(facet.value) ? [{ ...facet, value: facet.value }] : []))
    .toSorted(
      (left, right) => energyClasses.indexOf(left.value) - energyClasses.indexOf(right.value),
    );
