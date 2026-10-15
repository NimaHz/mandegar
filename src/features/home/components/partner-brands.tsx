import Image from "next/image";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { Marquee } from "@/components/motion/marquee";
import { pluralize } from "@/features/catalog/plural";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { BrandSummary } from "@/types/catalog";

import { homeContent } from "../content";
import { SectionLink } from "./section-link";

interface PartnerBrandsProps {
  brands: BrandSummary[];
  locale: Locale;
}

export function PartnerBrands({ brands, locale }: PartnerBrandsProps) {
  const content = homeContent[locale].partners;
  if (brands.length === 0) return null;
  const ordered = brands.toSorted((left, right) => Number(right.isOwn) - Number(left.isOwn));
  const repeated = ordered.length < 6 ? [...ordered, ...ordered] : ordered;

  return (
    <section aria-labelledby="home-partners" className="border-y border-line bg-surface">
      <div className="container-page flex flex-col gap-8 py-12 sm:py-14 lg:flex-row lg:items-center lg:gap-12">
        <div className="flex shrink-0 flex-col gap-2 lg:w-80">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="home-partners" className="font-display text-2xl leading-snug font-black text-ink">
            {content.title}
          </h2>
          <p className="text-sm leading-7 text-body">{content.description}</p>
          <div>
            <SectionLink href={localizePath(locale, routes.brands)}>{content.all}</SectionLink>
          </div>
        </div>
        <Marquee label={content.marqueeLabel} durationSeconds={36} className="min-w-0 flex-1 py-2">
          {repeated.map((brand, index) => (
            <Link
              key={`${brand.slug}-${index}`}
              href={localizePath(locale, routes.brand(brand.slug))}
              className={cn(
                "group flex shrink-0 items-center gap-3 rounded-full border bg-raised py-2 ps-2 pe-5 transition-colors hover:border-primary",
                brand.isOwn ? "border-primary/40" : "border-line",
              )}
            >
              <span className="relative grid size-11 place-items-center overflow-hidden rounded-full bg-sunken">
                {brand.isOwn ? (
                  <LogoMark className="size-8" />
                ) : brand.logo ? (
                  <Image src={brand.logo.src} alt="" fill sizes="44px" className="object-cover" />
                ) : (
                  <span aria-hidden className="font-display font-black text-ink">
                    {brand.name.slice(0, 1)}
                  </span>
                )}
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-extrabold whitespace-nowrap text-ink group-hover:text-primary">
                  {brand.name}
                </span>
                <span className="text-xs whitespace-nowrap text-muted">
                  {brand.isOwn
                    ? content.own
                    : pluralize(locale, brand.productCount, content.models)}
                </span>
              </span>
            </Link>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
