import { LogoMark } from "@/components/brand/logo-mark";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import type { SiteSettings } from "@/types/content";

import { aboutContent } from "../content";

interface AboutStatsProps {
  locale: Locale;
  stats: SiteSettings["stats"];
}

const order = ["years", "models", "serviceCenters", "warrantyMonths"] as const;

export function AboutStats({ locale, stats }: AboutStatsProps) {
  const content = aboutContent[locale].stats;
  const items = order.filter((key) => stats[key] > 0);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="about-stats" className="container-page">
      <div className="bg-dots relative isolate overflow-hidden rounded-panel bg-brand-deep px-6 py-12 text-white shadow-lift ring-1 ring-white/10 [--dots-color:rgb(255_255_255/0.08)] ring-inset sm:px-10 sm:py-16 lg:px-14">
        <LogoMark
          tone="mono"
          className="pointer-events-none absolute -end-24 -bottom-28 -z-10 size-[26rem] text-white/[0.05]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -start-24 -top-32 -z-10 size-96 rounded-full bg-primary/40 blur-3xl"
        />
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="text-label font-bold text-primary-glow">{content.eyebrow}</p>
          <h2
            id="about-stats"
            className="font-display text-[1.75rem] leading-snug font-black text-balance sm:text-[2.25rem]"
          >
            {content.title}
          </h2>
          <p className="text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
            {content.description}
          </p>
        </div>
        <dl
          className={cn(
            "mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-10 sm:mt-12",
            items.length >= 4 && "lg:grid-cols-4",
            items.length === 3 && "lg:grid-cols-3",
          )}
        >
          {items.map((key, index) => (
            <div key={key} className="flex flex-col-reverse gap-2">
              <dt className="text-sm leading-6 font-semibold text-white/70">
                {content.labels[key]}
              </dt>
              <dd
                className={cn(
                  "font-display text-[2.75rem] leading-none font-black tabular-nums sm:text-[3.5rem]",
                  index === 0 ? "text-accent" : "text-white",
                )}
              >
                {formatNumber(locale, stats[key])}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
