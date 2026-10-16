import { LogoMark } from "@/components/brand/logo-mark";
import { Reveal } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/config";
import type { SiteSettings } from "@/types/content";

import { homeContent } from "../content";
import { StatTicker } from "./stat-ticker";

interface BrandPromiseProps {
  stats: SiteSettings["stats"];
  locale: Locale;
}

const statKeys = ["years", "models", "serviceCenters", "warrantyMonths"] as const;

export function BrandPromise({ stats, locale }: BrandPromiseProps) {
  const content = homeContent[locale].promise;
  const items = statKeys.filter((key) => stats[key] > 0);

  return (
    <section
      aria-labelledby="home-promise"
      className="relative isolate overflow-hidden bg-brand-deep text-white"
    >
      <LogoMark
        tone="mono"
        className="pointer-events-none absolute -end-40 top-1/2 -z-10 size-[44rem] -translate-y-1/2 text-white/[0.06] sm:-end-24 lg:size-[52rem]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -start-32 -top-40 -z-10 size-[30rem] rounded-full bg-primary-glow/10 blur-3xl"
      />
      <div className="container-page grid gap-12 py-16 sm:py-20 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-end lg:gap-16 lg:py-28">
        <Reveal className="flex flex-col gap-5">
          <p className="inline-flex items-center gap-2 text-label font-bold text-accent">
            <span aria-hidden className="h-px w-8 bg-current" />
            {content.eyebrow}
          </p>
          <h2
            id="home-promise"
            className="font-display text-[2rem] leading-[1.3] font-black text-balance sm:text-[2.75rem] lg:text-[3.25rem]"
          >
            {content.statement} <span className="text-accent">{content.highlight}</span>
          </h2>
          <p className="max-w-xl text-lead leading-8 text-white/75 sm:text-lg sm:leading-9">
            {content.body}
          </p>
        </Reveal>
        {items.length > 0 && (
          <Reveal delay={0.1}>
            <dl
              aria-label={content.statsLabel}
              className="grid grid-cols-2 gap-px overflow-hidden rounded-panel bg-white/12 ring-1 ring-white/12"
            >
              {items.map((key) => (
                <div
                  key={key}
                  className="flex flex-col-reverse gap-2 bg-brand-deep/95 p-5 backdrop-blur last:odd:col-span-2 sm:p-7"
                >
                  <dt className="text-sm leading-6 text-white/70">{content.stats[key]}</dt>
                  <dd className="font-display text-4xl font-black tracking-tight sm:text-5xl">
                    <StatTicker value={stats[key]} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        )}
      </div>
    </section>
  );
}
