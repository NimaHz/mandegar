import { ArrowLeft, Clock3, ListOrdered, PlayCircle, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { GuideListItem } from "@/types/content";

import { catalogContent } from "../content";

interface GuideHighlightProps {
  guide: GuideListItem | null;
  locale: Locale;
}

export function GuideHighlight({ guide, locale }: GuideHighlightProps) {
  const content = catalogContent[locale].category;

  if (!guide) {
    return (
      <div className="flex flex-col items-start gap-4 panel p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="icon-tile size-12 rounded-field">
          <Wrench className="size-5.5" aria-hidden />
        </span>
        <div className="flex flex-1 flex-col gap-1.5">
          <h2 className="text-lg font-extrabold text-ink">{content.guideFallbackTitle}</h2>
          <p className="max-w-2xl text-sm leading-7 text-body">{content.guideFallbackBody}</p>
        </div>
        <Link
          href={localizePath(locale, routes.guides)}
          className={buttonVariants({ variant: "line" })}
        >
          {content.guideFallbackCta}
        </Link>
      </div>
    );
  }

  const minutes = guide.durationSec ? Math.max(1, Math.round(guide.durationSec / 60)) : null;

  return (
    <article className="group relative isolate grid overflow-hidden rounded-panel bg-brand-deep text-white shadow-lift md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <div className="relative aspect-video md:aspect-auto md:min-h-80">
        {guide.poster && (
          <Image
            src={guide.poster.src}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.03]"
          />
        )}
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-brand-deep/80 to-transparent md:from-brand-deep md:via-brand-deep/20 md:ltr:bg-linear-to-l md:rtl:bg-linear-to-r"
        />
        <span
          aria-hidden
          className="absolute inset-0 m-auto grid size-18 place-items-center rounded-full bg-white/15 ring-1 ring-white/35 backdrop-blur-md transition-transform duration-500 group-hover:scale-110"
        >
          <PlayCircle className="size-9" strokeWidth={1.4} />
        </span>
      </div>
      <div className="flex flex-col items-start gap-4 p-6 sm:p-8 lg:p-10">
        <span className="text-label font-bold text-accent">{content.guideEyebrow}</span>
        <h2 className="font-display text-2xl leading-snug font-black text-balance sm:text-[1.75rem]">
          {guide.title}
        </h2>
        <p className="text-sm leading-7 text-white/75 sm:text-lead sm:leading-8">{guide.summary}</p>
        <ul className="flex flex-wrap gap-2 text-xs font-bold">
          <li className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 ring-1 ring-white/15">
            <ListOrdered className="size-3.5" aria-hidden />
            {fill(content.guideSteps, { count: formatNumber(locale, guide.stepCount) })}
          </li>
          {minutes && (
            <li className="inline-flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-3 ring-1 ring-white/15">
              <Clock3 className="size-3.5" aria-hidden />
              {fill(content.guideMinutes, { count: formatNumber(locale, minutes) })}
            </li>
          )}
        </ul>
        <Link
          href={localizePath(locale, routes.guide(guide.slug))}
          className={buttonVariants({
            variant: "inverse",
            className: "mt-2 after:absolute after:inset-0 after:rounded-panel",
          })}
        >
          {content.guideCta}
          <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
