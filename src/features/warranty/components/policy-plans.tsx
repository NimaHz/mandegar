import { CalendarClock } from "lucide-react";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import type { WarrantyPolicySummary } from "@/types/warranty";

import type { WarrantyContent } from "../content";
import { CoverageList } from "./coverage-list";

interface PolicyPlansProps {
  locale: Locale;
  policies: WarrantyPolicySummary[];
  content: WarrantyContent["policies"];
}

export function PolicyPlans({ locale, policies, content }: PolicyPlansProps) {
  if (policies.length === 0) return null;

  return (
    <section aria-labelledby="warranty-policies-title" className="border-y border-line bg-surface">
      <div className="container-page flex flex-col gap-10 section-y">
        <SectionHeading
          id="warranty-policies-title"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />
        <RevealGroup className="grid gap-5 lg:grid-cols-2">
          {policies.map((policy) => (
            <RevealItem key={policy.id} className="min-w-0">
              <article className="flex h-full flex-col gap-6 card bg-raised p-5 shadow-card sm:p-7">
                <header className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-display text-xl font-black text-ink">{policy.name}</h3>
                    {policy.partsMonths !== null && (
                      <span className="self-start rounded-full bg-chip px-3 py-1 text-xs font-semibold text-ink-soft">
                        {fill(content.parts, { count: formatNumber(locale, policy.partsMonths) })}
                      </span>
                    )}
                  </div>
                  <p className="flex items-baseline gap-2 text-primary">
                    <span className="font-display text-5xl leading-none font-black">
                      {formatNumber(locale, policy.months)}
                    </span>
                    <span className="text-sm font-bold text-body">{content.months}</span>
                  </p>
                </header>
                <div className="flex items-start gap-3 rounded-field bg-sunken p-4">
                  <CalendarClock className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <div className="flex flex-col gap-0.5">
                    <p className="text-caption font-bold text-muted">{content.startRule}</p>
                    <p className="text-sm leading-7 text-body">{policy.startRule}</p>
                  </div>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <CoverageList
                    title={content.coverage}
                    items={policy.coverage}
                    variant="covered"
                    compact
                  />
                  <CoverageList
                    title={content.exclusions}
                    items={policy.exclusions}
                    variant="excluded"
                    compact
                  />
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
