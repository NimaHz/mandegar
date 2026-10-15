import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqSection } from "@/features/support/components/faq-section";
import { AfterSalesTimeline } from "@/features/support/components/hub/after-sales-timeline";
import { ContactStrip } from "@/features/support/components/hub/contact-strip";
import { SupportCards } from "@/features/support/components/hub/support-cards";
import { supportHubContent, ticketStatusCopy } from "@/features/support/content";
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
  const { meta } = supportHubContent[locale];
  return pageMetadata({
    locale,
    path: routes.support,
    title: meta.title,
    description: meta.description,
  });
}

export default async function SupportPage() {
  const locale = await getLocale();
  const content = supportHubContent[locale];
  const [{ nav, ui }, faqs, settings] = await Promise.all([
    getDictionary(locale),
    api.content.faqs(locale, "support"),
    api.content.settings(locale),
  ]);
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.support },
  ];
  const graph = await serviceGraph(locale, {
    path: routes.support,
    name: content.hero.title,
    description: content.hero.description,
    breadcrumbs,
    service: {
      id: "afterSalesService",
      ...seoContent[locale].afterSales,
      phone: settings.phones.at(-1)?.value,
      offers: Object.values(content.cards).map((card) => card.label),
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
      />
      <SupportCards locale={locale} content={content} />
      <AfterSalesTimeline
        locale={locale}
        content={content.timeline}
        statuses={ticketStatusCopy[locale]}
      />
      <FaqSection
        id="support-faq-title"
        eyebrow={content.faq.eyebrow}
        title={content.faq.title}
        faqs={faqs}
        more={{ href: localizePath(locale, routes.faq), label: content.faq.more }}
      />
      <ContactStrip locale={locale} content={content.contact} settings={settings} />
    </>
  );
}
