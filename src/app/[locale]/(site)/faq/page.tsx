import { ArrowLeft, LifeBuoy, MessagesSquare } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { FaqBrowser } from "@/features/faq/components/faq-browser";
import { faqContent } from "@/features/faq/content";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { faqGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";
import { faqGroups } from "@/types/content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = faqContent[locale];
  return pageMetadata({
    locale,
    path: routes.faq,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function FaqPage() {
  const locale = await getLocale();
  const faqs = await api.content.faqs(locale);
  const content = faqContent[locale];
  const sections = faqGroups
    .map((group) => ({ group, items: faqs.filter((faq) => faq.group === group) }))
    .filter((section) => section.items.length > 0);
  const graph = await faqGraph(
    locale,
    { name: content.title, description: content.description },
    sections.flatMap((section) => section.items),
  );

  return (
    <>
      <JsonLd data={graph} />
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description} />
      <div className="container-page flex flex-col gap-12 pb-16 sm:pb-20">
        <FaqBrowser sections={sections} content={content} />
        <section
          aria-labelledby="faq-cta"
          className="flex flex-col items-start gap-5 rounded-panel border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
        >
          <div className="flex items-start gap-4">
            <span className="icon-tile size-12 rounded-field">
              <MessagesSquare className="size-5.5" aria-hidden />
            </span>
            <div className="flex max-w-xl flex-col gap-1">
              <h2 id="faq-cta" className="font-display text-lg font-black text-ink">
                {content.ctaTitle}
              </h2>
              <p className="text-sm leading-7 text-body">{content.ctaBody}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={localizePath(locale, routes.serviceRequest)}
              className={buttonVariants({ variant: "line" })}
            >
              <LifeBuoy className="size-4" aria-hidden />
              {content.ctaService}
            </Link>
            <Link
              href={localizePath(locale, routes.contact)}
              className={buttonVariants({ className: "group" })}
            >
              {content.ctaContact}
              <ArrowLeft
                className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
