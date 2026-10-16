import { ArrowLeft, CircleCheck } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { routes } from "@/lib/routes";
import type { BrandDetail } from "@/types/catalog";

import { brandsContent } from "../content";

interface OwnBrandFeatureProps {
  brand: BrandDetail;
  locale: Locale;
}

export function OwnBrandFeature({ brand, locale }: OwnBrandFeatureProps) {
  const content = brandsContent[locale].listing;

  return (
    <article
      aria-labelledby={`brand-${brand.slug}`}
      className="relative isolate grid overflow-hidden rounded-panel bg-brand-deep text-white shadow-lift lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
    >
      <LogoMark
        tone="mono"
        className="pointer-events-none absolute -end-32 -bottom-48 -z-10 size-[36rem] text-white/[0.06]"
      />
      <div className="flex flex-col items-start gap-5 p-6 sm:p-10 lg:p-12">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-accent ring-1 ring-white/15">
          {content.own} · {content.ownLead}
        </span>
        <div className="flex items-center gap-4">
          <span className="grid size-16 place-items-center rounded-full bg-white shadow-lift sm:size-20">
            <LogoMark className="size-12 sm:size-14" />
          </span>
          <h2 id={`brand-${brand.slug}`} className="font-display text-4xl font-black sm:text-5xl">
            {brand.name}
          </h2>
        </div>
        <p className="max-w-2xl text-lead leading-8 text-white/80 sm:text-lg sm:leading-9">
          {brand.description}
        </p>
        <Link
          href={localizePath(locale, routes.brand(brand.slug))}
          className={buttonVariants({ variant: "accent", size: "lg", className: "group mt-2" })}
        >
          {content.viewModels}
          <span className="rounded-full bg-on-accent/10 px-2 py-0.5 text-xs">
            {pluralize(locale, brand.productCount, content.models)}
          </span>
          <ArrowLeft
            className="size-4.5 transition-transform group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
      <ul className="flex flex-col justify-center gap-3 border-t border-white/10 bg-white/[0.04] p-6 sm:p-10 lg:border-s lg:border-t-0">
        {content.promise.map((item) => (
          <li key={item} className="flex items-center gap-3 text-base font-bold">
            <CircleCheck className="size-5 shrink-0 text-accent" aria-hidden />
            {item}
          </li>
        ))}
      </ul>
    </article>
  );
}
