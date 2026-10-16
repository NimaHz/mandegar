import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TransitionProvider } from "@/components/providers/transition-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { CompareTray } from "@/components/shared/compare-tray";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SectionHeading } from "@/components/ui/section-heading";
import { CatalogResults } from "@/features/catalog/components/catalog-results";
import { CatalogToolbar } from "@/features/catalog/components/catalog-toolbar";
import { CategoryHero } from "@/features/catalog/components/category-hero";
import { FaqList } from "@/features/catalog/components/faq-list";
import { FiltersSidebar } from "@/features/catalog/components/filters-sidebar";
import { GuideHighlight } from "@/features/catalog/components/guide-highlight";
import { catalogContent } from "@/features/catalog/content";
import { isRefined, listingPath, toProductsQuery } from "@/features/catalog/filters";
import { loadCatalogSearchParams } from "@/features/catalog/search-params";
import { toTrayItems } from "@/features/compare/tray-items";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { categoryChoiceFaqs } from "@/lib/seo/answers";
import { categoryGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { ogEntityTarget } from "@/lib/seo/og/cards";
import { api } from "@/services";

const FAQ_LIMIT = 6;

export async function generateStaticParams() {
  const slugs = await api.catalog.categorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
  searchParams,
}: PageProps<"/[locale]/categories/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const [category, filters, { ui }] = await Promise.all([
    api.catalog.category(locale, slug),
    loadCatalogSearchParams(searchParams),
    getDictionary(locale),
  ]);
  if (!category) notFound();
  const result = await api.catalog.products(locale, toProductsQuery(filters, category.slug));
  if (filters.page > result.page) notFound();
  const page =
    filters.page > 1 ? fill(ui.paginationPage, { page: formatNumber(locale, filters.page) }) : null;
  return pageMetadata({
    locale,
    path: listingPath(routes.category(category.slug), filters),
    title: [page, category.seo.title ?? category.name].filter(Boolean).join(" · "),
    description: category.seo.description ?? category.summary,
    image: category.image
      ? { url: category.image.src, width: category.image.width, height: category.image.height }
      : null,
    og: await ogEntityTarget(locale, "category", category.slug),
    noindex: isRefined(filters),
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/[locale]/categories/[slug]">) {
  const locale = await getLocale();
  const { slug } = await params;
  const [category, filters, dictionary, guides, generalFaqs] = await Promise.all([
    api.catalog.category(locale, slug),
    loadCatalogSearchParams(searchParams),
    getDictionary(locale),
    api.content.guides(locale),
    api.content.faqs(locale, "general"),
  ]);
  if (!category) notFound();

  const content = catalogContent[locale].category;
  const query = toProductsQuery(filters, category.slug);
  const [result, facets, members, insights] = await Promise.all([
    api.catalog.products(locale, query),
    api.catalog.facets(locale, query),
    api.catalog.byCategory(locale, category.slug),
    api.catalog.categoryInsights(locale, category.slug),
  ]);
  if (filters.page > result.page) notFound();
  const productFaqs = [
    ...new Map(
      insights
        .slice(0, FAQ_LIMIT)
        .flatMap((insight) => insight.faqs)
        .map((faq) => [faq.question, faq]),
    ).values(),
  ].slice(0, FAQ_LIMIT);
  const faqs = [
    ...categoryChoiceFaqs(locale, category.name, insights),
    ...(productFaqs.length > 0 ? productFaqs : generalFaqs),
  ];
  const guide = guides.find((entry) =>
    entry.categories.some((item) => item.slug === category.slug),
  );
  const path = localizePath(locale, routes.category(category.slug));
  const breadcrumbs = [
    { label: dictionary.nav.home, href: localizePath(locale, routes.home) },
    { label: dictionary.nav.products, href: localizePath(locale, routes.products) },
    { label: category.name },
  ];
  const graph = await categoryGraph(locale, {
    path: listingPath(routes.category(category.slug), filters),
    category,
    products: result.items,
    breadcrumbs,
    faqTitle: content.faqTitle,
    faqs,
  });

  return (
    <TransitionProvider>
      <JsonLd data={graph} />
      <CategoryHero
        category={category}
        locale={locale}
        breadcrumbs={<Breadcrumbs label={dictionary.ui.breadcrumbsLabel} items={breadcrumbs} />}
      />

      <section aria-labelledby="category-products" className="container-page section-y pt-4!">
        <SectionHeading
          id="category-products"
          title={fill(content.productsTitle, { name: category.name })}
          description={content.productsDescription}
          className="mb-7"
        />
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <FiltersSidebar facets={facets} hideCategory className="hidden lg:flex" />
          <div className="flex min-w-0 flex-col gap-5">
            <CatalogToolbar total={result.total} facets={facets} hideCategory />
            <CatalogResults
              locale={locale}
              result={result}
              filters={filters}
              pathname={path}
              emptyCategory={members.length === 0}
            />
          </div>
        </div>
      </section>

      <section aria-label={content.guideEyebrow} className="container-page pb-12 lg:pb-16">
        <GuideHighlight guide={guide ?? null} locale={locale} />
      </section>

      {faqs.length > 0 && (
        <section aria-labelledby="category-faq" className="container-page section-y pt-4!">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] lg:gap-14">
            <SectionHeading
              id="category-faq"
              eyebrow={category.name}
              title={content.faqTitle}
              description={content.faqDescription}
              action={
                <Link
                  href={localizePath(locale, routes.faq)}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {content.faqAll}
                </Link>
              }
              className="h-fit flex-col items-start! lg:sticky lg:top-28"
            />
            <FaqList items={faqs} />
          </div>
        </section>
      )}
      <CompareTray products={toTrayItems(members)} />
    </TransitionProvider>
  );
}
