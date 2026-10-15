import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { SectionHeading } from "@/components/ui/section-heading";
import { BrandCard } from "@/features/brands/components/brand-card";
import { OwnBrandFeature } from "@/features/brands/components/own-brand-feature";
import { brandsContent } from "@/features/brands/content";
import { getLocale } from "@/i18n/get-locale";
import { routes } from "@/lib/routes";
import { brandsGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";
import type { BrandDetail } from "@/types/catalog";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { listing } = brandsContent[locale];
  return pageMetadata({
    locale,
    path: routes.brands,
    title: listing.metaTitle,
    description: listing.metaDescription,
  });
}

export default async function BrandsPage() {
  const locale = await getLocale();
  const { listing } = brandsContent[locale];
  const summaries = await api.catalog.brands(locale);
  const details = (
    await Promise.all(summaries.map((brand) => api.catalog.brand(locale, brand.slug)))
  ).filter((brand): brand is BrandDetail => brand !== null);
  const own = details.filter((brand) => brand.isOwn);
  const partners = details.filter((brand) => !brand.isOwn);
  const graph = await brandsGraph(
    locale,
    { name: listing.metaTitle, description: listing.metaDescription },
    details,
  );

  return (
    <>
      <JsonLd data={graph} />
      <PageHero
        eyebrow={listing.eyebrow}
        title={
          <>
            {listing.title} <span className="text-primary">{listing.titleHighlight}</span>
          </>
        }
        description={listing.description}
      />
      <div className="container-page flex flex-col gap-14 pb-16 lg:gap-20 lg:pb-24">
        {own.map((brand) => (
          <OwnBrandFeature key={brand.slug} brand={brand} locale={locale} />
        ))}
        {partners.length > 0 && (
          <section aria-labelledby="partner-brands" className="flex flex-col gap-8">
            <SectionHeading
              id="partner-brands"
              title={listing.partnersTitle}
              description={listing.partnersDescription}
            />
            <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {partners.map((brand) => (
                <RevealItem key={brand.slug}>
                  <BrandCard brand={brand} locale={locale} />
                </RevealItem>
              ))}
            </RevealGroup>
          </section>
        )}
      </div>
    </>
  );
}
