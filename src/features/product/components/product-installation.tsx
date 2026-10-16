import { ArrowLeft, BookOpenCheck, Clock3, LifeBuoy, TriangleAlert, Wrench } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ModelCodeText } from "@/components/shared/model-code-text";
import { VideoPlayer } from "@/components/shared/video-player";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { durationMinutes, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { GuideDetail } from "@/types/content";

import { productContent } from "../content";
import { serviceRequestHref } from "../links";

interface ProductInstallationProps {
  guide: GuideDetail | null;
  productSlug: string;
  locale: Locale;
}

export function ProductInstallation({ guide, productSlug, locale }: ProductInstallationProps) {
  const { installation, video } = productContent[locale];

  if (!guide) {
    return (
      <EmptyState
        icon={BookOpenCheck}
        title={installation.emptyTitle}
        description={installation.emptyDescription}
        action={
          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <Link
              href={localizePath(locale, routes.guides)}
              className={buttonVariants({ variant: "line", size: "sm" })}
            >
              {installation.emptyGuides}
            </Link>
            <Link
              href={serviceRequestHref(locale, productSlug)}
              className={buttonVariants({ size: "sm" })}
            >
              {installation.emptyRequest}
            </Link>
          </div>
        }
      />
    );
  }

  const minutes = guide.durationSec ? durationMinutes(guide.durationSec) : null;

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-6">
        {guide.video && (
          <VideoPlayer
            video={guide.video}
            chapters={guide.chapters}
            title={guide.title}
            durationSec={guide.durationSec}
            labels={video}
          />
        )}
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl font-extrabold text-ink">
            <ModelCodeText text={guide.title} />
          </h3>
          <p className="text-sm leading-7 text-body">{guide.summary}</p>
          {minutes && (
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
              <Clock3 className="size-3.5" aria-hidden />
              {fill(installation.minutes, { count: formatNumber(locale, minutes) })}
            </p>
          )}
        </div>
        {guide.safety.length > 0 && (
          <div
            role="note"
            className="flex gap-3.5 rounded-field border border-warning/30 bg-warning-soft px-4 py-4 sm:px-5"
          >
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-extrabold text-ink">{installation.safety}</h3>
              <ul className="flex list-disc flex-col gap-1.5 ps-4 text-sm leading-7 text-ink-soft marker:text-warning">
                {guide.safety.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {guide.tools.length > 0 && (
          <div className="flex flex-col gap-3">
            <h3 className="inline-flex items-center gap-2 text-sm font-extrabold text-ink">
              <Wrench className="size-4 text-muted" aria-hidden />
              {installation.tools}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {guide.tools.map((tool) => (
                <li
                  key={tool}
                  className="inline-flex h-8 items-center rounded-full border border-line-strong bg-surface px-3 text-xs font-bold text-ink-soft"
                >
                  {tool}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="text-base font-extrabold text-ink">{installation.steps}</h3>
        <ol className="relative flex flex-col gap-4">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4">
              <span className="relative z-10 grid size-9 shrink-0 place-items-center rounded-full bg-primary font-display text-sm font-black text-on-primary ring-4 ring-canvas">
                {formatNumber(locale, index + 1)}
              </span>
              {index < guide.steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute start-[1.0625rem] top-9 -bottom-4 w-0.5 bg-line"
                />
              )}
              <div className="flex min-w-0 flex-1 flex-col gap-3 card p-4">
                <div className="flex flex-col gap-1">
                  <span className="sr-only">
                    {fill(installation.step, { count: formatNumber(locale, index + 1) })}
                  </span>
                  <h4 className="font-extrabold text-ink">{step.title}</h4>
                  <p className="text-sm leading-7 text-body">{step.body}</p>
                </div>
                {step.image && (
                  <div className="relative aspect-video overflow-hidden rounded-control bg-sunken">
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      fill
                      sizes="(min-width: 1024px) 420px, 90vw"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href={localizePath(locale, routes.guide(guide.slug))}
            className={buttonVariants({ variant: "dark", className: "group" })}
          >
            {installation.fullGuide}
            <ArrowLeft
              className="size-4 transition-transform group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
          <Link
            href={serviceRequestHref(locale, productSlug)}
            className={buttonVariants({ variant: "line" })}
          >
            <LifeBuoy className="size-4.5" aria-hidden />
            {installation.emptyRequest}
          </Link>
        </div>
      </div>
    </div>
  );
}
