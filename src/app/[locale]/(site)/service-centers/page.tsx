import { MapPinOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { PendingRegion, TransitionProvider } from "@/components/providers/transition-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { mapLinks } from "@/features/info/map-links";
import { CenterCard } from "@/features/service-centers/components/center-card";
import { CentersFilters } from "@/features/service-centers/components/centers-filters";
import { DealerCta } from "@/features/service-centers/components/dealer-cta";
import { ProvinceSummary } from "@/features/service-centers/components/province-summary";
import { serviceCentersContent } from "@/features/service-centers/content";
import {
  loadServiceCentersSearchParams,
  serializeServiceCentersSearchParams,
} from "@/features/service-centers/search-params";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { isProvinceCode, provinces as allProvinces } from "@/lib/provinces";
import { routes } from "@/lib/routes";
import { serviceCentersGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";
import type { ServiceCenter } from "@/types/content";

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/service-centers">): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = serviceCentersContent[locale];
  const { province, kind } = await loadServiceCentersSearchParams(searchParams);
  return pageMetadata({
    locale,
    path: routes.serviceCenters,
    title: meta.title,
    description: meta.description,
    noindex: Boolean(province || kind),
  });
}

const groupByProvince = (centers: ServiceCenter[]) =>
  [...Map.groupBy(centers, (center) => center.province)].map(([code, items]) => ({
    code,
    name: items[0]?.provinceName ?? code,
    items,
  }));

export default async function ServiceCentersPage({
  searchParams,
}: PageProps<"/[locale]/service-centers">) {
  const locale = await getLocale();
  const content = serviceCentersContent[locale];
  const raw = await loadServiceCentersSearchParams(searchParams);
  const filters = {
    ...raw,
    province: raw.province && isProvinceCode(raw.province) ? raw.province : null,
  };
  const [{ nav, ui }, centers, provinceCounts] = await Promise.all([
    getDictionary(locale),
    api.content.serviceCenters(locale, filters),
    api.content.provinces(locale),
  ]);
  const provinceOptions = allProvinces
    .map((province) => ({ value: province.code, label: province.name[locale] }))
    .toSorted((left, right) => left.label.localeCompare(right.label, locale));
  const groups = filters.province ? null : groupByProvince(centers);
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.support, href: localizePath(locale, routes.support) },
    { label: nav.serviceCenters },
  ];
  const graph = await serviceCentersGraph(locale, {
    name: content.hero.title,
    description: content.hero.description,
    centers,
    breadcrumbs,
    mapUrl: (center) =>
      center.lat !== null && center.lng !== null
        ? mapLinks({ lat: center.lat, lng: center.lng }).neshan
        : null,
  });

  return (
    <TransitionProvider>
      <JsonLd data={graph} />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        breadcrumbs={<Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />}
      >
        <CentersFilters provinces={provinceOptions} copy={content.filters} />
      </PageHero>

      <section
        aria-labelledby="centers-results"
        className="container-page flex flex-col gap-8 pb-16"
      >
        <ProvinceSummary
          locale={locale}
          title={content.summary.title}
          provinces={provinceCounts}
          filters={filters}
        />
        <div className="flex items-center justify-between gap-3 border-t border-line pt-6">
          <h2 id="centers-results" className="font-display text-xl font-black text-ink">
            {filters.province
              ? (provinceCounts.find((entry) => entry.code === filters.province)?.name ??
                content.hero.title)
              : content.filters.allProvinces}
          </h2>
          <p role="status" className="text-sm font-semibold text-muted">
            {fill(content.summary.results, { count: formatNumber(locale, centers.length) })}
          </p>
        </div>
        <PendingRegion>
          {centers.length === 0 ? (
            <EmptyState
              icon={MapPinOff}
              title={content.empty.title}
              description={content.empty.description}
              action={
                <Link
                  href={localizePath(locale, routes.serviceCenters)}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1" })}
                >
                  {content.empty.action}
                </Link>
              }
            />
          ) : groups ? (
            <div className="flex flex-col gap-10">
              {groups.map((group) => (
                <section
                  key={group.code}
                  aria-labelledby={`province-${group.code}`}
                  className="flex flex-col gap-4"
                >
                  <h3
                    id={`province-${group.code}`}
                    className="flex items-center gap-2.5 text-lg font-extrabold text-ink"
                  >
                    <span aria-hidden className="h-5 w-1 rounded-full bg-accent" />
                    {group.name}
                    <span className="rounded-full bg-chip px-2 py-0.5 text-caption font-bold text-ink-soft">
                      {formatNumber(locale, group.items.length)}
                    </span>
                  </h3>
                  <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {group.items.map((center) => (
                      <RevealItem key={center.slug} className="min-w-0">
                        <CenterCard
                          locale={locale}
                          center={center}
                          copy={content}
                          headingLevel="h4"
                        />
                      </RevealItem>
                    ))}
                  </RevealGroup>
                </section>
              ))}
            </div>
          ) : (
            <RevealGroup
              key={serializeServiceCentersSearchParams(filters)}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {centers.map((center) => (
                <RevealItem key={center.slug} className="min-w-0">
                  <CenterCard locale={locale} center={center} copy={content} />
                </RevealItem>
              ))}
            </RevealGroup>
          )}
        </PendingRegion>
      </section>

      <DealerCta locale={locale} copy={content.dealer} />
    </TransitionProvider>
  );
}
