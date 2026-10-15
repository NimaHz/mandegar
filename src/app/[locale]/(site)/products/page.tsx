import { Search } from "lucide-react";
import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { TransitionProvider } from "@/components/providers/transition-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { CompareTray } from "@/components/shared/compare-tray";
import { CatalogResults } from "@/features/catalog/components/catalog-results";
import { CatalogSearch } from "@/features/catalog/components/catalog-search";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { FiltersSidebar } from "@/features/catalog/components/filters-sidebar";
import { catalogContent } from "@/features/catalog/content";
import { isFiltered, toProductsQuery } from "@/features/catalog/filters";
import { loadCatalogSearchParams } from "@/features/catalog/search-params";
import { toTrayItems } from "@/features/compare/tray-items";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { productListGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/products">): Promise<Metadata> {
  const locale = await getLocale();
  const filters = await loadCatalogSearchParams(searchParams);
  const { listing } = catalogContent[locale];
  return pageMetadata({
    locale,
    path: filters.category ? routes.category(filters.category) : routes.products,
    title: listing.metaTitle,
    description: listing.metaDescription,
    noindex: isFiltered(filters),
  });
}

export default async function ProductsPage({ searchParams }: PageProps<"/[locale]/products">) {
  const locale = await getLocale();
  const filters = await loadCatalogSearchParams(searchParams);
  const { listing } = catalogContent[locale];
  const [result, facets] = await Promise.all([
    api.catalog.products(locale, toProductsQuery(filters)),
    api.catalog.facets(locale),
  ]);

  const graph = await productListGraph(locale, {
    path: routes.products,
    name: listing.metaTitle,
    description: listing.metaDescription,
    listName: listing.metaTitle,
    products: result.items,
  });

  return (
    <TransitionProvider>
      <JsonLd data={graph} />
      <PageHero
        eyebrow={listing.eyebrow}
        title={
          filters.q ? (
            <span className="inline-flex items-center gap-3">
              <Search
                className="size-7 shrink-0 text-primary sm:size-9"
                strokeWidth={2.2}
                aria-hidden
              />
              <span>
                {listing.resultsFor} <bdi className="text-primary">«{filters.q}»</bdi>
              </span>
            </span>
          ) : (
            <>
              {listing.title} <span className="text-primary">{listing.titleHighlight}</span>
            </>
          )
        }
        description={listing.description}
      >
        <CatalogSearch />
      </PageHero>

      <section
        aria-labelledby="catalog-results"
        className="container-page grid grid-cols-1 items-start gap-6 pb-16 lg:grid-cols-[17rem_minmax(0,1fr)]"
      >
        <h2 id="catalog-results" className="sr-only">
          {listing.resultsTitle}
        </h2>
        <FiltersSidebar facets={facets} className="hidden lg:flex" />
        <div className="flex min-w-0 flex-col gap-5">
          <CatalogToolbar total={result.total} facets={facets} />
          <CatalogResults
            locale={locale}
            result={result}
            filters={filters}
            pathname={localizePath(locale, routes.products)}
            priorityCount={2}
          />
        </div>
      </section>
      <CompareTray products={toTrayItems(result.items)} />
    </TransitionProvider>
  );
}
