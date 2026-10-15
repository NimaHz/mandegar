import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqSection } from "@/features/support/components/faq-section";
import { LabelExplainer } from "@/features/warranty/components/label-explainer";
import { PolicyPlans } from "@/features/warranty/components/policy-plans";
import { WarrantyForm } from "@/features/warranty/components/warranty-form";
import { WarrantyLookup } from "@/features/warranty/components/warranty-lookup";
import { warrantyContent } from "@/features/warranty/content";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { seoContent } from "@/lib/seo/content";
import { serviceGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = warrantyContent[locale];
  return pageMetadata({
    locale,
    path: routes.warranty,
    title: meta.title,
    description: meta.description,
  });
}

export default async function WarrantyPage() {
  const locale = await getLocale();
  const content = warrantyContent[locale];
  const [{ nav, ui }, policies, faqs] = await Promise.all([
    getDictionary(locale),
    api.warranty.policies(locale),
    api.content.faqs(locale, "warranty"),
  ]);
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.support, href: localizePath(locale, routes.support) },
    { label: nav.warranty },
  ];
  const graph = await serviceGraph(locale, {
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
      <JsonLd data={graph} />
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        breadcrumbs={<Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />}
      >
        <WarrantyForm
          action={localizePath(locale, routes.warranty)}
          messages={content.code}
          copy={content.form}
        />
      </PageHero>

      <WarrantyLookup locale={locale} content={content} />

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
