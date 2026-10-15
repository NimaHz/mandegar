import { Check, Phone, Siren, Timer } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import type { SiteSettings } from "@/types/content";

import type { RequestFlowContent } from "../../content";
import { phoneHref } from "../../phone-href";

interface RequestAsideProps {
  locale: Locale;
  copy: RequestFlowContent;
  phones: SiteSettings["phones"];
}

export function RequestAside({ locale, copy, phones }: RequestAsideProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
      <section aria-labelledby="request-aside-title" className="card bg-raised p-5">
        <h2 id="request-aside-title" className="text-base font-extrabold text-ink">
          {copy.aside.title}
        </h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {copy.aside.points.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm leading-7 text-body">
              <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                <Check className="size-3" strokeWidth={3} aria-hidden />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </section>
      <section className="flex items-start gap-3 rounded-card bg-brand-deep p-5 text-white">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-accent">
          <Timer className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-extrabold">{copy.aside.responseTitle}</h2>
          <p className="text-xs leading-6 text-white/75">{copy.aside.responseBody}</p>
        </div>
      </section>
      {phones.length > 0 && (
        <section aria-labelledby="request-phone-title" className="card bg-raised p-5">
          <h2 id="request-phone-title" className="text-sm font-extrabold text-ink">
            {copy.aside.phoneTitle}
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {phones.map((phone) => (
              <li key={phone.value}>
                <a
                  href={phoneHref(phone.value)}
                  className="flex items-center justify-between gap-3 rounded-field border border-line px-3 py-2.5 transition-colors hover:border-primary hover:bg-primary-soft/40"
                >
                  <span className="text-xs font-semibold text-muted">{phone.label}</span>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
                    <bdi dir="ltr" className="font-code">
                      {phone.value}
                    </bdi>
                    <Phone className="size-4 text-primary" aria-hidden />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
      <a
        href="tel:194"
        className="flex items-center gap-3 rounded-card border border-danger/30 bg-danger-soft/60 p-4 transition-colors hover:bg-danger-soft"
      >
        <Siren className="size-5 shrink-0 text-danger" aria-hidden />
        <span className="text-xs leading-6 font-semibold text-ink">
          {copy.gas.title}{" "}
          <bdi dir="ltr" className="font-extrabold text-danger">
            {formatNumber(locale, 194, { useGrouping: false })}
          </bdi>
        </span>
      </a>
    </aside>
  );
}
