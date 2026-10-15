import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Download,
  Handshake,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { CompareToggle } from "@/components/shared/compare-toggle";
import { CopyButton } from "@/components/shared/copy-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EnergyBadge } from "@/features/catalog/components/energy-badge";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { ProductDetail } from "@/types/catalog";

import { productContent } from "../content";
import { ProductGallery } from "./product-gallery";
import { ShareButton } from "./share-button";

interface ProductHeaderProps {
  product: ProductDetail;
  locale: Locale;
  url: string;
  breadcrumbs: ReactNode;
}

export function ProductHeader({ product, locale, url, breadcrumbs }: ProductHeaderProps) {
  const { header } = productContent[locale];
  const catalog = product.downloads.find((download) => download.kind === "catalog");

  return (
    <section aria-labelledby="product-title" className="bg-glow">
      <div className="container-page flex flex-col gap-6 pt-6 pb-10 sm:pt-8 lg:pb-14">
        <div className="animate-fade">{breadcrumbs}</div>
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] lg:gap-14">
          <ProductGallery images={product.gallery} />

          <div className="flex animate-rise flex-col gap-6">
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={localizePath(locale, routes.brand(product.brand.slug))}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line-strong bg-surface ps-2.5 pe-3 text-label font-extrabold text-ink transition-colors hover:border-primary hover:text-primary"
                >
                  {product.brand.isOwn ? (
                    <BadgeCheck className="size-4 text-primary" aria-hidden />
                  ) : (
                    <Handshake className="size-4 text-accent-strong" aria-hidden />
                  )}
                  {product.brand.name}
                </Link>
                <Badge tone={product.brand.isOwn ? "primary" : "warning"} size="md">
                  {product.brand.isOwn ? header.own : header.partner}
                </Badge>
                {product.isNew && (
                  <Badge tone="accent" size="md">
                    {header.newBadge}
                  </Badge>
                )}
              </div>
              <Link
                href={localizePath(locale, routes.category(product.category.slug))}
                className="eyebrow transition-colors hover:text-primary-strong"
              >
                {product.category.name}
              </Link>
              <h1
                id="product-title"
                className="font-display text-[1.875rem] leading-[1.35] font-black text-balance text-ink sm:text-[2.375rem] lg:text-[2.75rem]"
              >
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <span className="inline-flex items-center gap-2 rounded-control bg-sunken py-1 ps-3 pe-1">
                  <span className="text-xs font-semibold text-muted">{header.model}</span>
                  <bdi dir="ltr" className="font-code text-sm font-bold tracking-wide text-ink">
                    {product.modelCode}
                  </bdi>
                  <CopyButton value={product.modelCode} label={header.model} className="size-7" />
                </span>
                {product.energyClass && (
                  <EnergyBadge
                    value={product.energyClass}
                    label={fill(header.energy, { value: product.energyClass })}
                    size="lg"
                  />
                )}
                {product.releaseYear && (
                  <span className="inline-flex items-center gap-1.5 text-label font-semibold text-muted">
                    <CalendarDays className="size-4" aria-hidden />
                    {fill(header.releaseYear, {
                      year: formatNumber(locale, product.releaseYear, { useGrouping: false }),
                    })}
                  </span>
                )}
              </div>
              <p className="max-w-xl text-lead leading-8 font-medium text-pretty text-ink-soft sm:text-lg sm:leading-9">
                {product.tagline}
              </p>
            </div>

            {product.keyFacts.length > 0 && (
              <div className="panel bg-raised p-1.5 shadow-card">
                <h2 className="sr-only">{header.keyFacts}</h2>
                <dl className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                  {product.keyFacts.map((fact) => (
                    <div
                      key={fact.label}
                      className="flex flex-col gap-1 rounded-[1.375rem] bg-surface px-4 py-3.5 last:odd:col-span-2 sm:last:odd:col-span-1"
                    >
                      <dt className="text-xs font-semibold text-muted">{fact.label}</dt>
                      <dd className="text-base leading-snug font-extrabold text-ink">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2.5">
              <CompareToggle slug={product.slug} name={product.name} variant="button" />
              <ShareButton
                url={url}
                title={fill(header.shareTitle, { name: product.name })}
                text={product.tagline}
                label={header.share}
                copyLabel={header.copyLink}
              />
              {catalog && (
                <a
                  href={catalog.file.href}
                  download
                  className={buttonVariants({
                    variant: "line",
                    size: "lg",
                    className: "h-12 text-sm",
                  })}
                >
                  <Download className="size-4.5" aria-hidden />
                  {header.catalog}
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-field border border-success/25 bg-success-soft/60 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-sm font-extrabold text-ink">
                <ShieldCheck className="size-5 text-success" strokeWidth={1.9} aria-hidden />
                {fill(header.warranty, { count: formatNumber(locale, product.warrantyMonths) })}
              </span>
              <Link
                href={localizePath(locale, routes.warranty)}
                className="group ms-auto inline-flex items-center gap-1 text-label font-bold text-success hover:underline"
              >
                {header.checkCode}
                <ArrowLeft
                  className="size-3.5 transition-transform group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
