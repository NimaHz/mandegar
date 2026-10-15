import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RequestAside } from "@/features/support/components/request/request-aside";
import { ServiceRequestFlow } from "@/features/support/components/request/service-request-flow";
import { requestFlowContent, ticketTypeCopy } from "@/features/support/content";
import { loadRequestSearchParams } from "@/features/support/search-params";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { webPageGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { parseWarrantyCode } from "@/lib/warranty-code";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = requestFlowContent[locale];
  return pageMetadata({
    locale,
    path: routes.serviceRequest,
    title: meta.title,
    description: meta.description,
  });
}

export default async function ServiceRequestPage({
  searchParams,
}: PageProps<"/[locale]/support/request">) {
  const locale = await getLocale();
  const content = requestFlowContent[locale];
  const [{ nav, ui }, prefill, brands, settings] = await Promise.all([
    getDictionary(locale),
    loadRequestSearchParams(searchParams),
    api.catalog.brands(locale),
    api.content.settings(locale),
  ]);
  const catalogs = await Promise.all(
    brands.map((brand) => api.catalog.byBrand(locale, brand.slug)),
  );
  const models = catalogs
    .flat()
    .map((product) => ({
      slug: product.slug,
      name: product.name,
      modelCode: product.modelCode,
      category: product.category.name,
    }))
    .toSorted((left, right) => left.modelCode.localeCompare(right.modelCode));
  const code = parseWarrantyCode(prefill.code);
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.support, href: localizePath(locale, routes.support) },
    { label: nav.serviceRequest },
  ];
  const graph = await webPageGraph(locale, {
    path: routes.serviceRequest,
    name: content.hero.title,
    description: content.hero.description,
    breadcrumbs,
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        breadcrumbs={<Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />}
      />
      <div className="container-page pb-16 sm:pb-20">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
          <ServiceRequestFlow
            models={models}
            prefill={{
              code: code.valid ? code.code : "",
              product: models.some((model) => model.slug === prefill.product)
                ? prefill.product
                : "",
            }}
            copy={content}
            types={ticketTypeCopy[locale]}
          />
          <RequestAside locale={locale} copy={content} phones={settings.phones} />
        </div>
      </div>
    </>
  );
}
