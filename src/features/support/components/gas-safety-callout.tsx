import { Phone, Siren } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";

interface GasSafetyCalloutProps {
  locale: Locale;
  title: string;
  steps: string[];
  note?: string;
}

export function GasSafetyCallout({ locale, title, steps, note }: GasSafetyCalloutProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-card border border-danger/40 bg-danger-soft p-4 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 animate-pulse place-items-center rounded-full bg-danger text-white dark:text-night">
          <Siren className="size-5" aria-hidden />
        </span>
        <p className="text-base font-extrabold text-danger">{title}</p>
      </div>
      <ol className="flex flex-col gap-2 ps-1">
        {steps.map((step, index) => (
          <li
            key={step}
            className="flex items-start gap-2.5 text-sm leading-7 font-semibold text-ink"
          >
            <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-danger text-caption font-black text-white dark:text-night">
              {formatNumber(locale, index + 1)}
            </span>
            {step}
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {note && <p className="text-xs leading-6 text-body">{note}</p>}
        <a
          href="tel:194"
          className="inline-flex h-10 items-center gap-2 rounded-control bg-danger px-4 text-sm font-extrabold text-white transition-opacity hover:opacity-90 dark:text-night"
        >
          <Phone className="size-4" aria-hidden />
          <bdi dir="ltr">{formatNumber(locale, 194, { useGrouping: false })}</bdi>
        </a>
      </div>
    </div>
  );
}
