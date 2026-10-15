import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { CategoryIcon } from "@/components/icons/category-icon";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { CategoryDetail } from "@/types/catalog";

import { catalogContent } from "../content";
import { pluralize } from "../plural";

interface CategoryHeroProps {
  category: CategoryDetail;
  locale: Locale;
  breadcrumbs: ReactNode;
}

export function CategoryHero({ category, locale, breadcrumbs }: CategoryHeroProps) {
  const content = catalogContent[locale].category;

  return (
    <section className="bg-glow bg-dots">
      <div className="container-page flex flex-col gap-7 pt-6 pb-10 sm:pt-8 lg:pb-14">
        <div className="animate-fade">{breadcrumbs}</div>
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-14">
          <div className="flex animate-rise flex-col items-start gap-5">
            <div className="flex items-center gap-3">
              <span className="icon-tile size-13 rounded-field">
                <CategoryIcon name={category.icon} className="size-6.5" strokeWidth={1.7} />
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="eyebrow">{content.eyebrow}</span>
                <span className="text-sm font-semibold text-muted">
                  {pluralize(locale, category.productCount, content.modelsCount)}
                </span>
              </span>
            </div>
            <h1 className="font-display text-[2.125rem] leading-[1.3] font-black text-balance text-ink sm:text-[2.75rem] lg:text-[3.25rem]">
              {category.name}
            </h1>
            <p className="max-w-xl text-lead leading-8 font-semibold text-pretty text-ink-soft sm:text-lg sm:leading-9">
              {category.summary}
            </p>
            {category.description && (
              <p className="max-w-xl text-sm leading-7 text-pretty text-body sm:text-lead sm:leading-8">
                {category.description}
              </p>
            )}
            {category.children.length > 0 && (
              <nav aria-label={content.subcategories} className="flex flex-wrap gap-2">
                {category.children.map((child) => (
                  <Link
                    key={child.slug}
                    href={localizePath(locale, routes.category(child.slug))}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong bg-surface ps-2 pe-3.5 text-label font-bold text-ink transition-colors hover:border-primary hover:text-primary"
                  >
                    <CategoryIcon name={child.icon} className="size-4 text-primary" />
                    {child.name}
                    <span className="text-xs font-semibold text-muted">
                      {formatNumber(locale, child.productCount)}
                    </span>
                  </Link>
                ))}
              </nav>
            )}
          </div>
          {category.image && (
            <div
              className="relative aspect-4/3 animate-rise overflow-hidden rounded-panel bg-sunken shadow-lift sm:aspect-16/11"
              style={{ animationDelay: "90ms" }}
            >
              <Image
                src={category.image.src}
                alt={category.image.alt}
                fill
                sizes="(min-width: 1280px) 620px, (min-width: 1024px) 50vw, 100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-linear-to-t from-night/45 via-transparent to-transparent"
              />
              <span
                aria-hidden
                className="absolute start-5 bottom-5 grid size-14 place-items-center rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-md"
              >
                <CategoryIcon name={category.icon} className="size-6.5" strokeWidth={1.6} />
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
