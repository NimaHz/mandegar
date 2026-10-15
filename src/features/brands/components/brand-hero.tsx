import { ExternalLink } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { pluralize } from "@/features/catalog/plural";
import type { Locale } from "@/i18n/config";
import { hostOf } from "@/lib/url";
import type { BrandDetail } from "@/types/catalog";

import { brandsContent } from "../content";
import { BrandLogo } from "./brand-logo";

interface BrandHeroProps {
  brand: BrandDetail;
  locale: Locale;
  breadcrumbs: ReactNode;
}

export function BrandHero({ brand, locale, breadcrumbs }: BrandHeroProps) {
  const content = brandsContent[locale].detail;

  return (
    <section className="bg-glow bg-dots">
      <div className="container-page flex flex-col gap-8 pt-6 pb-10 sm:pt-8 lg:pb-14">
        <div className="animate-fade">{breadcrumbs}</div>
        <div className="flex animate-rise flex-col items-start gap-6 md:flex-row md:items-center md:gap-10">
          <BrandLogo
            brand={brand}
            sizes="160px"
            priority
            className="size-28 shadow-lift ring-4 ring-surface sm:size-36"
          />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={brand.isOwn ? "primary" : "warning"}>
                {brand.isOwn ? content.own : content.partner}
              </Badge>
              <Badge tone="outline">{pluralize(locale, brand.productCount, content.models)}</Badge>
            </div>
            <h1 className="font-display text-[2.125rem] leading-tight font-black text-ink sm:text-5xl">
              {brand.name}
            </h1>
            <p className="max-w-3xl text-lead leading-8 text-pretty text-body sm:text-lg sm:leading-9">
              {brand.description}
            </p>
            {!brand.isOwn && (
              <p className="text-sm font-semibold text-ink-soft">{content.partnerNote}</p>
            )}
            {brand.website && (
              <a
                href={brand.website}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <ExternalLink className="size-4" aria-hidden />
                {content.website}
                <bdi dir="ltr" className="font-code text-xs text-muted">
                  {hostOf(brand.website)}
                </bdi>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
