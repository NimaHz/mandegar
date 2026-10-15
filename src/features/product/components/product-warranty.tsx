import { CircleCheck, CircleMinus, ScanLine, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { WarrantyPolicySummary } from "@/types/warranty";

import { productContent } from "../content";
import { serviceRequestHref } from "../links";

interface ProductWarrantyProps {
  months: number;
  policy: WarrantyPolicySummary | null;
  productSlug: string;
  locale: Locale;
}

export function ProductWarranty({ months, policy, productSlug, locale }: ProductWarrantyProps) {
  const { warranty } = productContent[locale];

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div className="relative isolate flex flex-col gap-6 overflow-hidden rounded-panel bg-brand-deep p-6 text-white shadow-lift sm:p-8">
        <ShieldCheck
          className="absolute -end-10 -bottom-10 -z-10 size-64 text-white/[0.06]"
          strokeWidth={1}
          aria-hidden
        />
        <div className="flex items-end gap-3">
          <span className="font-display text-7xl leading-none font-black text-accent">
            {formatNumber(locale, months)}
          </span>
          <span className="pb-2 text-lg font-bold">{warranty.months}</span>
        </div>
        {policy?.partsMonths && (
          <p className="text-sm font-semibold text-white/75">
            {fill(warranty.partsMonths, { count: formatNumber(locale, policy.partsMonths) })}
          </p>
        )}
        {policy && (
          <div className="flex flex-col gap-1.5 border-t border-white/15 pt-5">
            <h3 className="text-sm font-extrabold text-white">{warranty.startRule}</h3>
            <p className="text-sm leading-7 text-white/75">{policy.startRule}</p>
          </div>
        )}
        <div className="mt-auto flex flex-wrap gap-2.5">
          <Link
            href={localizePath(locale, routes.warranty)}
            className={buttonVariants({ variant: "accent" })}
          >
            <ScanLine className="size-4.5" aria-hidden />
            {warranty.check}
          </Link>
          <Link
            href={serviceRequestHref(locale, productSlug)}
            className={buttonVariants({
              variant: "ghost",
              className: "text-white ring-1 ring-white/30 hover:bg-white/10",
            })}
          >
            {warranty.request}
          </Link>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {policy && policy.coverage.length > 0 && (
          <div className="flex flex-col gap-3 card p-5 shadow-card">
            <h3 className="text-sm font-extrabold text-ink">{warranty.coverage}</h3>
            <ul className="flex flex-col gap-2.5">
              {policy.coverage.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-body">
                  <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        {policy && policy.exclusions.length > 0 && (
          <div className="flex flex-col gap-3 card p-5 shadow-card">
            <h3 className="text-sm font-extrabold text-ink">{warranty.exclusions}</h3>
            <ul className="flex flex-col gap-2.5">
              {policy.exclusions.map((item) => (
                <li key={item} className="flex gap-2 text-sm leading-6 text-body">
                  <CircleMinus className="mt-0.5 size-4.5 shrink-0 text-danger" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-3 card bg-sunken p-5 sm:col-span-2">
          <h3 className="text-sm font-extrabold text-ink">{warranty.howTitle}</h3>
          <ol className="grid gap-3 sm:grid-cols-3">
            {warranty.how.map((step, index) => (
              <li key={step} className="flex gap-2.5 text-sm leading-6 text-body">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-black text-on-primary">
                  {formatNumber(locale, index + 1)}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
