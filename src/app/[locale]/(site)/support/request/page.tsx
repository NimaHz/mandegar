import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RequestAside } from "@/features/support/components/request/request-aside";
import { ServiceRequestFlow } from "@/features/support/components/request/service-request-flow";
import { requestFlowContent, ticketTypeCopy } from "@/features/support/content";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { webPageGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
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

export default async function ServiceRequestPage() {
  const locale = await getLocale();
  const content = requestFlowContent[locale];
  const [{ nav, ui }, models, settings] = await Promise.all([
    getDictionary(locale),
    api.catalog.models(locale),
    api.content.settings(locale),
  ]);
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
          <ServiceRequestFlow models={models} copy={content} types={ticketTypeCopy[locale]} />
          <RequestAside locale={locale} copy={content} phones={settings.phones} />
        </div>
      </div>
    </>
  );
}
