import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";

import { aboutContent } from "../content";
import { WaveDivider } from "./wave-divider";

export function AboutHero({ locale }: { locale: Locale }) {
  const { hero } = aboutContent[locale];

  return (
    <section aria-labelledby="about-title" className="bg-glow bg-dots overflow-hidden">
      <div className="container-page grid items-center gap-12 pt-10 pb-12 sm:pt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-16 lg:pt-20 lg:pb-16">
        <div className="flex animate-rise flex-col items-start gap-6">
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1
            id="about-title"
            className="font-display text-[2.5rem] leading-[1.25] font-black text-balance text-ink sm:text-[3.5rem] lg:text-[4rem]"
          >
            <span className="text-primary">{hero.titleAccent}</span>
            {hero.titleRest}
          </h1>
          <p className="max-w-xl text-lg leading-9 text-pretty text-body">{hero.mission}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizePath(locale, routes.products)}
              className={buttonVariants({ size: "lg", className: "group" })}
            >
              {hero.primaryCta}
              <ArrowLeft
                className="size-4.5 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
            <Link
              href={localizePath(locale, routes.serviceCenters)}
              className={buttonVariants({ variant: "line", size: "lg" })}
            >
              <MapPin className="size-4.5" aria-hidden />
              {hero.secondaryCta}
            </Link>
          </div>
        </div>

        <aside
          aria-label={hero.entryLabel}
          className="relative isolate animate-fade overflow-hidden panel bg-raised p-7 shadow-lift sm:p-10"
          style={{ animationDelay: "120ms" }}
        >
          <LogoMark className="absolute end-7 top-7 size-14 sm:end-10 sm:top-10 sm:size-16" />
          <dl className="flex flex-col">
            <dt className="flex flex-col gap-2">
              <span className="font-display text-[2.75rem] leading-none font-black text-ink sm:text-[3.5rem]">
                {hero.word}
              </span>
              <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <bdi dir="ltr" className="font-code text-muted">
                  /{hero.pronunciation}/
                </bdi>
                <span className="font-bold text-accent-strong">{hero.partOfSpeech}</span>
              </span>
            </dt>
            <dd className="mt-7 border-t border-line pt-6">
              <ol className="flex flex-col gap-5">
                {hero.senses.map((sense, index) => (
                  <li key={sense} className="flex gap-4">
                    <span
                      aria-hidden
                      className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-primary-soft font-display text-sm font-black text-primary"
                    >
                      {formatNumber(locale, index + 1)}
                    </span>
                    <span className="text-base leading-8 text-ink-soft">{sense}</span>
                  </li>
                ))}
              </ol>
            </dd>
          </dl>
        </aside>
      </div>
      <WaveDivider />
    </section>
  );
}
