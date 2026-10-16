import { Clock3, Info, ListOrdered, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ModelCodeText } from "@/components/shared/model-code-text";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { durationMinutes, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { GuideListItem } from "@/types/content";

import { homeContent } from "../content";
import { SectionLink } from "./section-link";

interface InstallationGuidesProps {
  guides: GuideListItem[];
  locale: Locale;
}

export function InstallationGuides({ guides, locale }: InstallationGuidesProps) {
  const content = homeContent[locale].guides;
  const items = guides.slice(0, 3);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="home-guides" className="bg-sunken">
      <div className="container-page section-y">
        <SectionHeading
          id="home-guides"
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
          action={
            <SectionLink href={localizePath(locale, routes.guides)}>{content.all}</SectionLink>
          }
          className="mb-8"
        />
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {items.map((guide, index) => {
            const minutes = guide.durationSec ? durationMinutes(guide.durationSec) : null;
            return (
              <RevealItem key={guide.slug} className={index === 2 ? "sm:max-lg:hidden" : undefined}>
                <article className="group relative isolate flex h-full card-interactive flex-col overflow-hidden card bg-raised shadow-card">
                  <div className="relative aspect-video overflow-hidden bg-brand-deep">
                    {guide.poster && (
                      <Image
                        src={guide.poster.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                        className="object-cover opacity-90 transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.04]"
                      />
                    )}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-linear-to-t from-night/70 via-night/10 to-transparent"
                    />
                    <span
                      aria-hidden
                      className="absolute start-4 bottom-4 grid size-12 place-items-center rounded-full bg-white text-brand-deep shadow-lift transition-transform duration-500 group-hover:scale-110"
                    >
                      <Play className="size-5 translate-x-px" fill="currentColor" />
                    </span>
                    {minutes && (
                      <span className="absolute end-4 bottom-4 inline-flex h-7 items-center gap-1.5 rounded-full bg-night/60 px-2.5 text-xs font-bold text-white backdrop-blur">
                        <Clock3 className="size-3.5" aria-hidden />
                        {fill(content.minutes, { count: formatNumber(locale, minutes) })}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-2.5 p-5">
                    {guide.categories[0] && (
                      <p className="text-caption font-bold text-primary">
                        {guide.categories[0].name}
                      </p>
                    )}
                    <h3 className="text-base leading-snug font-extrabold text-balance text-ink sm:text-lg">
                      <Link
                        href={localizePath(locale, routes.guide(guide.slug))}
                        className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset"
                      >
                        <ModelCodeText text={guide.title} />
                      </Link>
                    </h3>
                    <p className="line-clamp-2 text-label leading-6 text-body">{guide.summary}</p>
                    <p className="mt-auto inline-flex items-center gap-1.5 border-t border-line pt-3.5 text-xs font-semibold text-muted">
                      <ListOrdered className="size-3.5" aria-hidden />
                      {pluralize(locale, guide.stepCount, content.steps)}
                    </p>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-raised px-4 py-2 text-label font-semibold text-ink-soft shadow-card">
          <Info className="size-4 text-primary" aria-hidden />
          {content.note}
        </p>
      </div>
    </section>
  );
}
