import { ArrowLeft, Check, Handshake } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

import type { ServiceCentersContent } from "../content";

interface DealerCtaProps {
  locale: Locale;
  copy: ServiceCentersContent["dealer"];
}

export function DealerCta({ locale, copy }: DealerCtaProps) {
  return (
    <section aria-labelledby="dealer-cta-title" className="container-page pb-16 sm:pb-20">
      <div className="relative isolate grid gap-8 overflow-hidden rounded-panel bg-brand-deep p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center">
        <LogoMark
          tone="mono"
          className="pointer-events-none absolute -start-20 -bottom-28 -z-10 size-80 text-white/[0.05]"
        />
        <div className="flex flex-col gap-3">
          <span className="inline-flex items-center gap-2 text-label font-bold text-accent">
            <Handshake className="size-4.5" aria-hidden />
            {copy.eyebrow}
          </span>
          <h2 id="dealer-cta-title" className="font-display text-2xl font-black sm:text-3xl">
            {copy.title}
          </h2>
          <p className="text-sm leading-7 text-white/75 sm:text-base sm:leading-8">{copy.body}</p>
        </div>
        <div className="flex flex-col gap-5">
          <ul className="flex flex-col gap-2.5">
            {copy.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-2.5 text-sm font-semibold text-white/90"
              >
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-white/15">
                  <Check className="size-3" strokeWidth={3} aria-hidden />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={{
              pathname: localizePath(locale, routes.contact),
              query: { department: "partnership" },
            }}
            className="group inline-flex h-12 items-center justify-center gap-2 self-start rounded-field bg-accent px-5 text-sm font-extrabold text-on-accent transition-colors hover:bg-accent/90"
          >
            {copy.cta}
            <ArrowLeft
              className="size-4.5 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
