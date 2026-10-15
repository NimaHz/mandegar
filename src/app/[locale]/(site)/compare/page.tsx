import { GitCompareArrows } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { CompareHighlight } from "@/features/compare/components/compare-highlight";
import { CompareStoreSync } from "@/features/compare/components/compare-store-sync";
import { CompareTable } from "@/features/compare/components/compare-table";
import { compareContent } from "@/features/compare/content";
import { MODELS_PARAM } from "@/features/compare/href";
import { parseModels } from "@/features/compare/models";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { page } = compareContent[locale];
  return pageMetadata({
    locale,
    path: routes.compare,
    title: page.metaTitle,
    description: page.metaDescription,
    noindex: true,
  });
}

export default async function ComparePage({ searchParams }: PageProps<"/[locale]/compare">) {
  const locale = await getLocale();
  const { page } = compareContent[locale];
  const requested = parseModels((await searchParams)[MODELS_PARAM]);
  const products = requested.length > 0 ? await api.catalog.compare(locale, requested) : [];

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} description={page.description} />
      <section
        aria-label={page.tableCaption}
        className="container-page flex flex-col gap-6 pb-16 lg:pb-24"
      >
        <CompareStoreSync
          requested={requested.length > 0}
          slugs={products.map((product) => product.slug)}
        />
        {products.length === 0 ? (
          <EmptyState
            icon={GitCompareArrows}
            title={page.emptyTitle}
            description={page.emptyDescription}
            headingLevel="h2"
            className="mx-auto w-full max-w-2xl"
            action={
              <div className="mt-2 flex flex-col items-center gap-5">
                <ol className="flex flex-col gap-2 text-start text-sm text-body sm:flex-row sm:gap-5">
                  {page.steps.map((step, index) => (
                    <li key={step} className="flex items-center gap-2">
                      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary-soft text-xs font-black text-primary">
                        {formatNumber(locale, index + 1)}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Link href={localizePath(locale, routes.products)} className={buttonVariants()}>
                  {page.emptyAction}
                </Link>
              </div>
            }
          />
        ) : (
          <CompareHighlight>
            <CompareTable products={products} locale={locale} />
          </CompareHighlight>
        )}
      </section>
    </>
  );
}
