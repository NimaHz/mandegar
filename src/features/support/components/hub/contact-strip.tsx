import { Clock, Mail, Phone, Siren } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import { phoneHref } from "@/lib/phone";
import type { SiteSettings } from "@/types/content";

import type { SupportHubContent } from "../../content";

interface ContactStripProps {
  locale: Locale;
  content: SupportHubContent["contact"];
  settings: SiteSettings;
}

export function ContactStrip({ locale, content, settings }: ContactStripProps) {
  const email = settings.emails[0];

  return (
    <section aria-labelledby="support-contact-title" className="container-page pb-16 sm:pb-20">
      <div className="relative isolate overflow-hidden rounded-panel bg-brand-deep p-6 text-white sm:p-10">
        <LogoMark
          tone="mono"
          className="pointer-events-none absolute -end-16 -bottom-24 -z-10 size-80 text-white/[0.05]"
        />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-center">
          <div className="flex flex-col gap-3">
            <h2 id="support-contact-title" className="font-display text-2xl font-black sm:text-3xl">
              {content.title}
            </h2>
            <p className="text-sm leading-7 text-white/75 sm:text-base">{content.body}</p>
            <p className="inline-flex items-center gap-2 text-sm text-white/80">
              <Clock className="size-4 shrink-0 text-accent" aria-hidden />
              <span className="font-semibold">{content.hours}:</span> {settings.hours}
            </p>
            {email && (
              <a
                href={`mailto:${email.value}`}
                className="inline-flex items-center gap-2 self-start text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
              >
                <Mail className="size-4 shrink-0 text-accent" aria-hidden />
                <bdi dir="ltr">{email.value}</bdi>
              </a>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {settings.phones.map((phone) => (
                <li key={phone.value}>
                  <a
                    href={phoneHref(phone.value)}
                    className="flex h-full flex-col gap-1 rounded-card bg-white/[0.07] p-4 ring-1 ring-white/10 transition-colors hover:bg-white/[0.12]"
                  >
                    <span className="text-caption font-semibold text-white/65">{phone.label}</span>
                    <span className="inline-flex items-center gap-2 text-lg font-extrabold">
                      <Phone className="size-4.5 text-accent" aria-hidden />
                      <bdi dir="ltr" className="font-code tracking-wide whitespace-nowrap">
                        {phone.value}
                      </bdi>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="tel:194"
              className="flex items-center gap-3 rounded-card bg-danger p-4 text-white transition-opacity hover:opacity-95 dark:text-night"
            >
              <Siren className="size-6 shrink-0" aria-hidden />
              <span className="flex flex-col">
                <span className="text-sm font-extrabold">
                  {content.gasTitle}{" "}
                  <bdi dir="ltr">{formatNumber(locale, 194, { useGrouping: false })}</bdi>
                </span>
                <span className="text-xs leading-6 opacity-90">{content.gasBody}</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
