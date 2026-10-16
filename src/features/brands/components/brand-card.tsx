import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { routes } from "@/lib/routes";
import type { BrandDetail } from "@/types/catalog";

import { brandsContent } from "../content";
import { BrandLogo } from "./brand-logo";

interface BrandCardProps {
  brand: BrandDetail;
  locale: Locale;
}

export function BrandCard({ brand, locale }: BrandCardProps) {
  const content = brandsContent[locale].listing;

  return (
    <article className="group relative isolate flex h-full card-interactive flex-col gap-5 card p-6 shadow-card">
      <div className="flex items-center gap-4">
        <BrandLogo brand={brand} sizes="64px" className="size-16" />
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-lg font-extrabold text-ink">
            <Link
              href={localizePath(locale, routes.brand(brand.slug))}
              className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset"
            >
              {brand.name}
            </Link>
          </h3>
          <span className="text-xs font-bold text-accent-strong">{content.partner}</span>
        </div>
      </div>
      <p className="line-clamp-3 text-sm leading-7 text-body">{brand.description}</p>
      <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
        <span className="text-label font-bold text-ink-soft">
          {pluralize(locale, brand.productCount, content.models)}
        </span>
        <span
          aria-hidden
          className="grid size-9 place-items-center rounded-full bg-chip text-ink transition-[background-color,color,translate] duration-300 group-hover:-translate-x-0.5 group-hover:bg-primary group-hover:text-on-primary ltr:group-hover:translate-x-0.5"
        >
          <ArrowLeft className="size-4 ltr:rotate-180" />
        </span>
      </div>
    </article>
  );
}
