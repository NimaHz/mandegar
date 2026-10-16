import { PackageOpen } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CompareTray } from "@/components/shared/compare-tray";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { BrandHero } from "@/features/brands/components/brand-hero";
import { brandsContent } from "@/features/brands/content";
import { ProductGrid } from "@/features/catalog/components/product-grid";
import { toTrayItems } from "@/features/compare/tray-items";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { brandGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { ogEntityTarget } from "@/lib/seo/og/cards";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await api.catalog.brandSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/brands/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const brand = await api.catalog.brand(locale, slug);
  if (!brand) notFound();
  return pageMetadata({
    locale,
    path: routes.brand(brand.slug),
    title: brand.seo.title ?? fill(brandsContent[locale].detail.metaTitle, { name: brand.name }),
    description: brand.seo.description ?? brand.description,
    image: brand.logo
      ? { url: brand.logo.src, width: brand.logo.width, height: brand.logo.height }
      : null,
    og: await ogEntityTarget(locale, "brand", brand.slug),
  });
}

export default async function BrandPage({ params }: PageProps<"/[locale]/brands/[slug]">) {
  const locale = await getLocale();
  const { slug } = await params;
  const [brand, products, dictionary] = await Promise.all([
    api.catalog.brand(locale, slug),
    api.catalog.byBrand(locale, slug),
    getDictionary(locale),
  ]);
  if (!brand) notFound();
  const { detail } = brandsContent[locale];
  const breadcrumbs = [
    { label: dictionary.nav.home, href: localizePath(locale, routes.home) },
    { label: dictionary.nav.brands, href: localizePath(locale, routes.brands) },
    { label: brand.name },
  ];
  const graph = await brandGraph(locale, { brand, products, breadcrumbs });

  return (
    <>
      <JsonLd data={graph} />
      <BrandHero
        brand={brand}
        locale={locale}
        breadcrumbs={<Breadcrumbs label={dictionary.ui.breadcrumbsLabel} items={breadcrumbs} />}
      />
      <section aria-labelledby="brand-products" className="container-page pt-4 pb-16 lg:pb-24">
        <SectionHeading
          id="brand-products"
          title={fill(detail.productsTitle, { name: brand.name })}
          description={detail.productsDescription}
          className="mb-8"
        />
        {products.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title={detail.emptyTitle}
            description={detail.emptyDescription}
            action={
              <Link
                href={localizePath(locale, routes.products)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1" })}
              >
                {detail.emptyAction}
              </Link>
            }
          />
        ) : (
          <ProductGrid products={products} locale={locale} layout="full" priorityCount={1} />
        )}
      </section>
      <CompareTray products={toTrayItems(products)} />
    </>
  );
}
