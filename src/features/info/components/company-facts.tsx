import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { jalaliToGregorianYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { SiteSettings } from "@/types/content";

import { aboutContent } from "../content";

interface CompanyFactsProps {
  locale: Locale;
  company: SiteSettings["company"];
}

const plain = (locale: Locale, value: number) =>
  formatNumber(locale, value, { useGrouping: false });

export function CompanyFacts({ locale, company }: CompanyFactsProps) {
  const content = aboutContent[locale].facts;
  const facts = [
    { label: content.legalName, value: company.legalName || null, code: false },
    {
      label: content.foundingYear,
      value:
        company.foundingYear &&
        fill(content.yearFormat, {
          jalali: plain(locale, company.foundingYear),
          gregorian: plain(locale, jalaliToGregorianYear(company.foundingYear)),
        }),
      code: false,
    },
    { label: content.nationalId, value: company.nationalId, code: true },
    { label: content.registrationNo, value: company.registrationNo, code: true },
  ].filter((fact): fact is { label: string; value: string; code: boolean } => Boolean(fact.value));

  if (facts.length === 0) return null;

  return (
    <section aria-labelledby="company-facts" className="container-page">
      <div className="grid gap-6 rounded-card border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-12">
        <h2 id="company-facts" className="font-display text-lg font-black text-ink">
          {content.title}
        </h2>
        <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col gap-1 border-s-2 border-line ps-4">
              <dt className="text-xs font-semibold text-muted">{fact.label}</dt>
              <dd className="text-sm leading-7 font-bold text-ink">
                {fact.code ? (
                  <bdi dir="ltr" className="font-code">
                    {fact.value}
                  </bdi>
                ) : (
                  fact.value
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
