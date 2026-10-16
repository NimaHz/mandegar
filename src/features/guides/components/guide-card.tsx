import { Clock, ListOrdered, Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ModelCodeText } from "@/components/shared/model-code-text";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { durationMinutes, formatNumber } from "@/lib/format";
import { blurProps } from "@/lib/image";
import { routes } from "@/lib/routes";
import type { GuideListItem } from "@/types/content";

import type { GuidesContent } from "../content";

interface GuideCardProps {
  guide: GuideListItem;
  locale: Locale;
  copy: GuidesContent["card"];
  priority?: boolean;
}

export function GuideCard({ guide, locale, copy, priority = false }: GuideCardProps) {
  return (
    <Link
      href={localizePath(locale, routes.guide(guide.slug))}
      className="group flex h-full card-interactive flex-col overflow-hidden card bg-raised"
    >
      <div className="relative aspect-video overflow-hidden bg-sunken">
        {guide.poster && (
          <Image
            src={guide.poster.src}
            {...blurProps(guide.poster)}
            alt={guide.poster.alt}
            fill
            sizes="(min-width: 1280px) 26rem, (min-width: 768px) 45vw, 92vw"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.04]"
          />
        )}
        <span
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-night/60 via-transparent to-transparent"
        />
        {guide.durationSec !== null && (
          <span className="absolute start-3 bottom-3 grid size-11 place-items-center rounded-full bg-white/95 text-brand-deep shadow-card transition-transform duration-300 group-hover:scale-110">
            <Play className="size-4.5 translate-x-px fill-current" aria-hidden />
          </span>
        )}
        <span className="absolute end-3 bottom-3 inline-flex items-center gap-1.5 rounded-full bg-night/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur">
          <Clock className="size-3.5" aria-hidden />
          {guide.durationSec !== null
            ? fill(copy.minutes, {
                count: formatNumber(locale, durationMinutes(guide.durationSec)),
              })
            : copy.textOnly}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {guide.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {guide.categories.map((category) => (
              <span
                key={category.slug}
                className="rounded-full bg-primary-soft px-2.5 py-0.5 text-caption font-bold text-primary"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
        <h3 className="font-display text-lg leading-snug font-extrabold text-ink transition-colors group-hover:text-primary">
          <ModelCodeText text={guide.title} />
        </h3>
        <p className="line-clamp-2 text-sm leading-7 text-body">{guide.summary}</p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5">
            <ListOrdered className="size-4" aria-hidden />
            {pluralize(locale, guide.stepCount, copy.steps)}
          </span>
          <span className="font-bold text-primary">{copy.view}</span>
        </div>
      </div>
    </Link>
  );
}
