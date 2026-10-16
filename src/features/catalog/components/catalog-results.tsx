import { PackageOpen, SearchX } from "lucide-react";
import Link from "next/link";

import { PendingRegion } from "@/components/providers/transition-provider";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import type { Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
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
  emptyCategory?: boolean;
}

export async function CatalogResults({
  locale,
  result,
  filters,
  pathname,
  priorityCount = 0,
  emptyCategory = false,
}: CatalogResultsProps) {
  const { ui, nav } = await getDictionary(locale);
  const { listing, category } = catalogContent[locale];
  const empty = emptyCategory ? (
    <EmptyState
      icon={PackageOpen}
      title={category.emptyTitle}
      description={category.emptyDescription}
      action={
        <Link
          href={localizePath(locale, routes.products)}
          className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1" })}
        >
          {nav.allProducts}
        </Link>
      }
    />
  ) : (
    <EmptyState
      icon={SearchX}
      title={listing.emptyTitle}
      description={listing.emptyDescription}
      action={<ClearFiltersButton />}
    />
  );

  return (
    <PendingRegion className="flex flex-col gap-8">
      {result.items.length === 0 ? (
        empty
      ) : (
        <div key={serializeCatalogSearchParams(filters)}>
          <ProductGrid products={result.items} locale={locale} priorityCount={priorityCount} />
        </div>
      )}
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
    </PendingRegion>
  );
}
