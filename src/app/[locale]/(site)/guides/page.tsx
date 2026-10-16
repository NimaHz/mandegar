import { BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { GuideCard } from "@/features/guides/components/guide-card";
import { GuideFilters } from "@/features/guides/components/guide-filters";
import { guidesContent } from "@/features/guides/content";
import { loadGuidesSearchParams } from "@/features/guides/search-params";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { routes } from "@/lib/routes";
import { collectionGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { localeUrl } from "@/lib/seo/urls";
import { api } from "@/services";

const FIRST_ROW = 3;

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/guides">): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = guidesContent[locale];
  const { category } = await loadGuidesSearchParams(searchParams);
  return pageMetadata({
    locale,
    path: routes.guides,
    title: meta.title,
    description: meta.description,
    noindex: Boolean(category),
  });
}

export default async function GuidesPage({ searchParams }: PageProps<"/[locale]/guides">) {
  const locale = await getLocale();
  const content = guidesContent[locale];
  const [{ nav, ui }, { category }, guides] = await Promise.all([
    getDictionary(locale),
    loadGuidesSearchParams(searchParams),
    api.content.guides(locale),
  ]);
  const categories = [
    ...new Map(
      guides.flatMap((guide) => guide.categories).map((entry) => [entry.slug, entry.name]),
    ),
  ].map(([slug, name]) => ({
    slug,
    name,
    count: guides.filter((guide) => guide.categories.some((entry) => entry.slug === slug)).length,
  }));
  const active = categories.some((entry) => entry.slug === category) ? category : null;
  const visible = active
    ? guides.filter((guide) => guide.categories.some((entry) => entry.slug === active))
    : guides;
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.guides },
  ];
  const graph = await collectionGraph(locale, {
    path: routes.guides,
    name: content.hero.title,
    description: content.hero.description,
    listName: content.hero.title,
    breadcrumbs,
    entries: visible.map((guide) => ({
      url: localeUrl(locale, routes.guide(guide.slug)),
      name: guide.title,
      image: guide.poster?.src,
    })),
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        breadcrumbs={<Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />}
      >
        <GuideFilters
          locale={locale}
          label={content.filter.label}
          allLabel={content.filter.all}
          total={guides.length}
          active={active}
          categories={categories}
        />
      </PageHero>
      <section aria-labelledby="guides-results" className="container-page pb-16 sm:pb-20">
        <h2 id="guides-results" className="sr-only">
          {content.hero.title}
        </h2>
        <p role="status" className="mb-4 text-sm font-semibold text-muted">
          {pluralize(locale, visible.length, content.filter.results)}
        </p>
        {visible.length === 0 ? (
          <EmptyState
            icon={BookOpenText}
            title={content.empty.title}
            description={content.empty.description}
            action={
              <Link
                href={localizePath(locale, routes.guides)}
                className={buttonVariants({ variant: "outline", size: "sm", className: "mt-1" })}
              >
                {content.empty.action}
              </Link>
            }
          />
        ) : (
          <RevealGroup
            key={active ?? "all"}
            className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {visible.map((guide, index) => (
              <RevealItem key={guide.slug} className="min-w-0">
                <GuideCard
                  guide={guide}
                  locale={locale}
                  copy={content.card}
                  priority={index < FIRST_ROW}
                />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </section>
    </>
  );
}
