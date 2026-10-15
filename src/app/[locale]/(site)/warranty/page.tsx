import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqSection } from "@/features/support/components/faq-section";
import { requestClientKey } from "@/features/warranty/client-key";
import { LabelExplainer } from "@/features/warranty/components/label-explainer";
import { PolicyPlans } from "@/features/warranty/components/policy-plans";
import { WarrantyForm } from "@/features/warranty/components/warranty-form";
import { WarrantyResult } from "@/features/warranty/components/warranty-result";
import { warrantyContent } from "@/features/warranty/content";
import { loadWarrantySearchParams } from "@/features/warranty/search-params";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { seoContent } from "@/lib/seo/content";
import { serviceGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/warranty">): Promise<Metadata> {
  const locale = await getLocale();
  const { code } = await loadWarrantySearchParams(searchParams);
  const { meta } = warrantyContent[locale];
  return pageMetadata({
    locale,
    path: routes.warranty,
    title: code ? meta.resultTitle : meta.title,
    description: meta.description,
    noindex: code.length > 0,
  });
}

export default async function WarrantyPage({ searchParams }: PageProps<"/[locale]/warranty">) {
  const locale = await getLocale();
  const { code } = await loadWarrantySearchParams(searchParams);
  const content = warrantyContent[locale];
  const [{ nav, ui }, policies, faqs, lookup] = await Promise.all([
    getDictionary(locale),
    api.warranty.policies(locale),
    api.content.faqs(locale, "warranty"),
    code
      ? requestClientKey().then((clientKey) => api.warranty.lookup(locale, code, clientKey))
      : null,
  ]);
  const serverIssue = lookup?.status === "invalid" ? lookup.reason : null;
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.support, href: localizePath(locale, routes.support) },
    { label: nav.warranty },
  ];
  const graph = code
    ? null
    : await serviceGraph(locale, {
        path: routes.warranty,
        name: content.hero.title,
        description: content.hero.description,
        breadcrumbs,
        service: {
          id: "warrantyService",
          name: content.hero.title,
          description: content.hero.description,
          serviceType: seoContent[locale].warrantyServiceType,
        },
        faqTitle: content.faq.title,
        faqs,
      });

  return (
    <>
      {graph && <JsonLd data={graph} />}
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        breadcrumbs={<Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />}
      >
        <WarrantyForm
          key={code}
          action={localizePath(locale, routes.warranty)}
          defaultCode={code}
          serverIssue={serverIssue}
          messages={content.code}
          copy={content.form}
        />
      </PageHero>

      {lookup && lookup.status !== "invalid" && (
        <div className="container-page pb-6 sm:pb-10">
          <div className="mx-auto max-w-5xl">
            <WarrantyResult lookup={lookup} locale={locale} content={content} />
          </div>
        </div>
      )}

      <LabelExplainer locale={locale} content={content.label} />
      <PolicyPlans locale={locale} policies={policies} content={content.policies} />
      <FaqSection
        id="warranty-faq-title"
        eyebrow={content.faq.eyebrow}
        title={content.faq.title}
        faqs={faqs}
        more={{ href: localizePath(locale, routes.faq), label: content.faq.more }}
      />
    </>
  );
}
