import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { AfterSalesNote } from "@/features/info/components/after-sales-note";
import { ContactChannels } from "@/features/info/components/contact-channels";
import { ContactForm } from "@/features/info/components/contact-form";
import { contactContent } from "@/features/info/content";
import { getLocale } from "@/i18n/get-locale";
import { routes } from "@/lib/routes";
import { organizationPageGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = contactContent[locale];
  return pageMetadata({
    locale,
    path: routes.contact,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function ContactPage() {
  const locale = await getLocale();
  const settings = await api.content.settings(locale);
  const content = contactContent[locale];
  const graph = await organizationPageGraph(locale, {
    path: routes.contact,
    type: "ContactPage",
    name: content.title,
    description: content.description,
  });

  return (
    <>
      <JsonLd data={graph} />
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="container-page grid grid-cols-1 items-start gap-5 pb-16 sm:pb-20 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-6">
        <AfterSalesNote
          locale={locale}
          content={content.afterSales}
          className="lg:col-start-2 lg:row-start-1"
        />
        <ContactForm content={content} className="lg:col-start-1 lg:row-span-2 lg:row-start-1" />
        <ContactChannels
          locale={locale}
          content={content}
          settings={settings}
          className="lg:col-start-2 lg:row-start-2"
        />
      </div>
    </>
  );
}
