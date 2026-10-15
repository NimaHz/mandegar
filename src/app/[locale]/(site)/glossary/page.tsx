import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { GlossaryJumpNav } from "@/features/glossary/components/glossary-jump-nav";
import {
  GlossarySection,
  type ResolvedLink,
} from "@/features/glossary/components/glossary-section";
import { glossaryRelations, type GlossarySlug, glossarySlugs } from "@/features/glossary/config";
import { glossaryContent } from "@/features/glossary/content";
import { glossaryLetters } from "@/features/glossary/terms";
import { fill } from "@/i18n/fill";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = glossaryContent[locale];
  return pageMetadata({
    locale,
    path: routes.glossary,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function GlossaryPage() {
  const locale = await getLocale();
  const [categories, guides] = await Promise.all([
    api.catalog.categories(locale),
    api.content.guides(locale),
  ]);
  const content = glossaryContent[locale];
  const categoryNames = new Map(categories.map((category) => [category.slug, category.name]));
  const guideTitles = new Map(guides.map((guide) => [guide.slug, guide.title]));
  const letters = glossaryLetters(locale);

  const linksFor = (slug: GlossarySlug): ResolvedLink[] =>
    glossaryRelations[slug].flatMap((relation) => {
      if (relation.kind === "page") {
        return [
          {
            href: localizePath(locale, routes[relation.page]),
            label: content.pages[relation.page],
          },
        ];
      }
      const label =
        relation.kind === "category"
          ? categoryNames.get(relation.slug)
          : guideTitles.get(relation.slug);
      if (!label) return [];
      const path =
        relation.kind === "category" ? routes.category(relation.slug) : routes.guide(relation.slug);
      return [{ href: localizePath(locale, path), label }];
    });

  return (
    <>
      <PageHero eyebrow={content.eyebrow} title={content.title} description={content.description}>
        <p className="rounded-full bg-primary-soft px-4 py-1.5 text-label font-bold text-primary">
          {fill(content.termCount, { count: formatNumber(locale, glossarySlugs.length) })}
        </p>
      </PageHero>
      <GlossaryJumpNav letters={letters} label={content.jumpLabel} />
      <div className="container-page flex flex-col gap-10 pt-10 pb-16 sm:gap-12 sm:pb-20">
        {letters
          .filter((group) => group.terms.length > 0)
          .map((group) => (
            <GlossarySection
              key={group.anchor}
              group={group}
              links={linksFor}
              relatedLabel={content.related}
              copyLabel={content.copyLink}
            />
          ))}
      </div>
    </>
  );
}
