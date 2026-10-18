import {
  ArrowLeft,
  BookOpenCheck,
  type LucideIcon,
  MapPin,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ModelCodeText } from "@/components/shared/model-code-text";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { jalaliToGregorianYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { blurProps, phoneWidth } from "@/lib/image";
import { routes } from "@/lib/routes";
import type { WarrantyCodeStatus, WarrantyMatch } from "@/types/warranty";

import type { WarrantyContent } from "../content";
import { CoverageList } from "./coverage-list";
import { FocusHeading } from "./focus-heading";

interface FoundResultProps {
  match: WarrantyMatch;
  locale: Locale;
  content: WarrantyContent;
  headingId: string;
}

const statusMeta: Record<
  WarrantyCodeStatus,
  { icon: LucideIcon; tone: "success" | "danger" | "warning"; tile: string }
> = {
  active: { icon: ShieldCheck, tone: "success", tile: "bg-success text-white dark:text-night" },
  revoked: { icon: ShieldX, tone: "danger", tile: "bg-danger text-white dark:text-night" },
  recalled: { icon: ShieldAlert, tone: "warning", tile: "bg-warning text-white dark:text-night" },
};

const productionYearLabel = (locale: Locale, year: number) =>
  `${formatNumber(locale, year, { useGrouping: false })} (${formatNumber(locale, jalaliToGregorianYear(year), { useGrouping: false })})`;

export function FoundResult({ match, locale, content, headingId }: FoundResultProps) {
  const { result } = content;
  const status = content.status[match.status];
  const meta = statusMeta[match.status];
  const StatusIcon = meta.icon;
  const covered = match.status !== "revoked";
  const { product } = match;
  const productHref = product.listed ? localizePath(locale, routes.product(product.slug)) : null;
  const frameClass =
    "relative block aspect-[4/3] overflow-hidden rounded-card border border-line bg-sunken";
  const nameClass = "font-display text-xl leading-snug font-extrabold text-ink";
  const photo = product.image ? (
    <Image
      src={product.image.src}
      {...blurProps(product.image)}
      alt={product.image.alt}
      fill
      sizes={`(min-width: 1024px) 26rem, ${phoneWidth(90)}`}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
    />
  ) : (
    <span className="grid size-full place-items-center">
      <Wrench className="size-12 text-subtle" aria-hidden />
    </span>
  );

  const facts = [
    {
      label: result.brand,
      value: (
        <span className="inline-flex flex-wrap items-center gap-2">
          {product.brand.name}
          {!product.brand.isOwn && (
            <Badge tone="accent" size="sm">
              {result.partner}
            </Badge>
          )}
        </span>
      ),
    },
    {
      label: result.model,
      value: (
        <bdi dir="ltr" className="font-code font-bold">
          {product.modelCode}
        </bdi>
      ),
    },
    {
      label: result.category,
      value: product.category.listed ? (
        <Link
          href={localizePath(locale, routes.category(product.category.slug))}
          className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
        >
          {product.category.name}
        </Link>
      ) : (
        product.category.name
      ),
    },
    { label: result.productionYear, value: productionYearLabel(locale, match.productionYear) },
  ];

  return (
    <article aria-labelledby={headingId} className="overflow-hidden panel bg-raised shadow-lift">
      <header className="flex flex-col gap-4 border-b border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <div className="flex items-start gap-3.5">
          <span className={cn("grid size-12 shrink-0 place-items-center rounded-field", meta.tile)}>
            <StatusIcon className="size-6" aria-hidden />
          </span>
          <div className="flex flex-col gap-1.5">
            <Badge tone={meta.tone} size="sm" className="self-start">
              {status.badge}
            </Badge>
            <FocusHeading
              id={headingId}
              className="font-display text-xl font-black text-ink sm:text-2xl"
            >
              {status.title}
            </FocusHeading>
          </div>
        </div>
        <div className="flex flex-col gap-1 rounded-field border border-dashed border-line-strong bg-surface px-4 py-2.5 sm:items-end">
          <span className="text-caption font-semibold text-muted">{result.codeLabel}</span>
          <bdi dir="ltr" className="font-code text-lg font-bold tracking-[0.14em] text-ink">
            {match.code}
          </bdi>
        </div>
      </header>

      <p className="border-b border-line bg-surface px-5 py-3.5 text-sm leading-7 text-body sm:px-7">
        {status.body}
      </p>

      <div className="grid grid-cols-1 gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-8">
        <div className="flex flex-col gap-5">
          {productHref ? (
            <Link href={productHref} className={cn("group", frameClass)}>
              {photo}
            </Link>
          ) : (
            <div className={frameClass}>{photo}</div>
          )}
          <div className="flex flex-col gap-1">
            {productHref ? (
              <Link
                href={productHref}
                className={cn(nameClass, "transition-colors hover:text-primary")}
              >
                <ModelCodeText text={product.name} />
              </Link>
            ) : (
              <p className={nameClass}>
                <ModelCodeText text={product.name} />
              </p>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-0.5">
                <dt className="text-caption font-semibold text-muted">{fact.label}</dt>
                <dd className="text-sm font-semibold text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {covered ? (
          <div className="flex flex-col gap-6">
            <div className="relative overflow-hidden rounded-card bg-brand-deep p-5 text-white sm:p-6">
              <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-6xl leading-none font-black text-accent">
                    {formatNumber(locale, match.months)}
                  </span>
                  <span className="flex flex-col text-sm leading-6 font-bold text-white/90">
                    <span>{result.monthsUnit}</span>
                    <span className="text-white/65">{result.monthsLabel}</span>
                  </span>
                </p>
                {match.partsMonths > 0 && (
                  <span className="mb-1 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85 ring-1 ring-white/15">
                    {fill(result.parts, { count: formatNumber(locale, match.partsMonths) })}
                  </span>
                )}
              </div>
              <div className="mt-5 border-t border-white/15 pt-4">
                <p className="text-caption font-bold text-white/60">{result.startRule}</p>
                <p className="mt-1 text-sm leading-7 text-white/90">{match.startRule}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <CoverageList
                title={result.coverage}
                items={match.coverage}
                variant="covered"
                compact
              />
              <CoverageList
                title={result.exclusions}
                items={match.exclusions}
                variant="excluded"
                compact
              />
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 self-start rounded-card border border-danger/30 bg-danger-soft/60 p-5">
            <ShieldX className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-ink">{result.noCoverTitle}</p>
              <p className="text-sm leading-7 text-body">{result.noCoverBody}</p>
            </div>
          </div>
        )}
      </div>

      <footer className="flex flex-col gap-5 border-t border-line bg-surface px-5 py-5 sm:px-7">
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={{
              pathname: localizePath(locale, routes.serviceRequest),
              query: { code: match.code },
            }}
            className={buttonVariants({ className: "group max-sm:w-full" })}
          >
            <Wrench className="size-4.5" aria-hidden />
            {result.requestService}
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href={localizePath(locale, routes.serviceCenters)}
            className={buttonVariants({ variant: "line", className: "max-sm:flex-1" })}
          >
            <MapPin className="size-4.5" aria-hidden />
            {result.findCenter}
          </Link>
          {productHref && (
            <Link
              href={{ pathname: productHref, hash: "installation" }}
              className={buttonVariants({ variant: "line", className: "max-sm:flex-1" })}
            >
              <BookOpenCheck className="size-4.5" aria-hidden />
              {result.installGuide}
            </Link>
          )}
        </div>
        <div className="flex items-start gap-3 rounded-field border border-line bg-raised p-4">
          <Receipt className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-ink">{result.genuineTitle}</p>
            <p className="text-sm leading-7 text-body">{result.genuineBody}</p>
          </div>
        </div>
      </footer>
    </article>
  );
}
