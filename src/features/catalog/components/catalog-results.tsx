import { SearchX } from "lucide-react";

import { PendingRegion } from "@/components/providers/transition-provider";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import type { ProductListItem } from "@/types/catalog";
import type { Paginated } from "@/types/common";

import { catalogContent } from "../content";
import { type CatalogFilters, serializeCatalogSearchParams } from "../search-params";
import { ClearFiltersButton } from "./clear-filters-button";
import { ProductGrid } from "./product-grid";

interface CatalogResultsProps {
  locale: Locale;
  result: Paginated<ProductListItem>;
  filters: CatalogFilters;
  pathname: string;
  priorityCount?: number;
}

export async function CatalogResults({
  locale,
  result,
  filters,
  pathname,
  priorityCount = 0,
}: CatalogResultsProps) {
  const { ui } = await getDictionary(locale);
  const { listing } = catalogContent[locale];

  return (
    <div className="flex flex-col gap-8">
      <PendingRegion>
        {result.items.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={listing.emptyTitle}
            description={listing.emptyDescription}
            action={<ClearFiltersButton />}
          />
        ) : (
          <div key={serializeCatalogSearchParams(filters)}>
            <ProductGrid products={result.items} locale={locale} priorityCount={priorityCount} />
          </div>
        )}
      </PendingRegion>
      <Pagination
        page={result.page}
        pageCount={result.pageCount}
        locale={locale}
        labels={ui}
        createHref={(page) => ({
          pathname,
          search: serializeCatalogSearchParams({ ...filters, page: page === 1 ? null : page }),
        })}
      />
    </div>
  );
}
