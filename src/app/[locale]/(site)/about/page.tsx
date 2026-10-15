import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { AboutBrands } from "@/features/info/components/about-brands";
import { AboutCta } from "@/features/info/components/about-cta";
import { AboutHero } from "@/features/info/components/about-hero";
import { AboutProcess } from "@/features/info/components/about-process";
import { AboutQuality } from "@/features/info/components/about-quality";
import { AboutStats } from "@/features/info/components/about-stats";
import { AboutStory } from "@/features/info/components/about-story";
import { AboutSymbol } from "@/features/info/components/about-symbol";
import { AboutValues } from "@/features/info/components/about-values";
import { CompanyFacts } from "@/features/info/components/company-facts";
import { aboutContent } from "@/features/info/content";
import { getLocale } from "@/i18n/get-locale";
import { routes } from "@/lib/routes";
import { organizationPageGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = aboutContent[locale];
  return pageMetadata({
    locale,
    path: routes.about,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function AboutPage() {
  const locale = await getLocale();
  const [settings, brands] = await Promise.all([
    api.content.settings(locale),
    api.catalog.brands(locale),
  ]);
  const content = aboutContent[locale];
  const graph = await organizationPageGraph(locale, {
    path: routes.about,
    type: "AboutPage",
    name: content.metaTitle,
    description: content.metaDescription,
  });

  return (
    <div className="flex flex-col gap-20 pb-16 sm:gap-28 sm:pb-24">
      <JsonLd data={graph} />
      <AboutHero locale={locale} />
      <AboutStory locale={locale} />
      <AboutSymbol locale={locale} />
      <AboutValues locale={locale} />
      <AboutStats locale={locale} stats={settings.stats} />
      <AboutProcess locale={locale} />
      <AboutQuality locale={locale} />
      <AboutBrands locale={locale} brands={brands} />
      <div className="flex flex-col gap-8">
        <AboutCta locale={locale} />
        <CompanyFacts locale={locale} company={settings.company} />
      </div>
    </div>
  );
}
