import { Search } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHero } from "@/components/layout/page-hero";
import { TransitionProvider } from "@/components/providers/transition-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { CompareTray } from "@/components/shared/compare-tray";
import { CatalogResults } from "@/features/catalog/components/catalog-results";
import { CatalogSearch } from "@/features/catalog/components/catalog-search";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { FiltersSidebar } from "@/features/catalog/components/filters-sidebar";
import { catalogContent } from "@/features/catalog/content";
import { isRefined, listingPath, toProductsQuery } from "@/features/catalog/filters";
import { type CatalogFilters, loadCatalogSearchParams } from "@/features/catalog/search-params";
import { toTrayItems } from "@/features/compare/tray-items";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { productListGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { ogEntityTarget } from "@/lib/seo/og/cards";
import { api } from "@/services";
import type { CategoryDetail } from "@/types/catalog";

interface ListingView {
  path: string;
  title: string;
  description: string;
  name: string;
  summary: string;
  noindex: boolean;
}

const listingView = (
  locale: Locale,
  filters: CatalogFilters,
  category: CategoryDetail | null,
): ListingView => {
  if (category) {
    return {
      path: routes.category(category.slug),
      title: category.seo.title ?? category.name,
      description: category.seo.description ?? category.summary,
      name: category.name,
      summary: category.summary,
      noindex: true,
    };
  }
  const { listing } = catalogContent[locale];
  return {
    path: filters.category ? routes.products : listingPath(routes.products, filters),
    title: listing.metaTitle,
    description: listing.metaDescription,
    name: listing.metaTitle,
    summary: listing.metaDescription,
    noindex: Boolean(filters.category) || isRefined(filters),
  };
};

const loadListing = async (locale: Locale, filters: CatalogFilters) => {
  const [result, category] = await Promise.all([
    api.catalog.products(locale, toProductsQuery(filters)),
    filters.category ? api.catalog.category(locale, filters.category) : null,
  ]);
  if (filters.page > result.page) notFound();
  const exact = category?.slug === filters.category ? category : null;
  return { result, category: exact, view: listingView(locale, filters, exact) };
};

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/products">): Promise<Metadata> {
  const locale = await getLocale();
  const filters = await loadCatalogSearchParams(searchParams);
  const [{ category, view }, { ui }] = await Promise.all([
    loadListing(locale, filters),
    getDictionary(locale),
  ]);
  const page =
    filters.page > 1 ? fill(ui.paginationPage, { page: formatNumber(locale, filters.page) }) : null;
  return pageMetadata({
    locale,
    path: view.path,
    title: [page, view.title].filter(Boolean).join(" · "),
    description: view.description,
    og: category ? await ogEntityTarget(locale, "category", category.slug) : undefined,
    noindex: view.noindex,
  });
}

export default async function ProductsPage({ searchParams }: PageProps<"/[locale]/products">) {
  const locale = await getLocale();
  const filters = await loadCatalogSearchParams(searchParams);
  const { listing } = catalogContent[locale];
  const [{ result, view }, facets] = await Promise.all([
    loadListing(locale, filters),
    api.catalog.facets(locale),
  ]);

  const graph = await productListGraph(locale, {
    path: view.path,
    name: view.name,
    description: view.summary,
    listName: view.name,
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
