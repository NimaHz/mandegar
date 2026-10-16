import { CalendarCheck, Clock, ListOrdered } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { VideoPlayer } from "@/components/shared/video-player";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { GuideAside } from "@/features/guides/components/guide-aside";
import { GuideSteps } from "@/features/guides/components/guide-steps";
import { GuideTranscript } from "@/features/guides/components/guide-transcript";
import { guidesContent } from "@/features/guides/content";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { formatDate } from "@/lib/dates";
import { durationMinutes, formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { guideGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { ogEntityTarget } from "@/lib/seo/og/cards";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await api.content.guideSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const guide = await api.content.guide(locale, slug);
  if (!guide) notFound();
  return pageMetadata({
    locale,
    path: routes.guide(guide.slug),
    og: await ogEntityTarget(locale, "guide", guide.slug),
    title: guide.title,
    description: guide.summary,
    type: "article",
    image: guide.poster
      ? {
          url: guide.poster.src,
          width: guide.poster.width,
          height: guide.poster.height,
          alt: guide.poster.alt,
        }
      : null,
    publishedTime: guide.publishedAt ?? undefined,
    modifiedTime: guide.updatedAt,
  });
}

export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const locale = await getLocale();
  const { slug } = await params;
  const [guide, { nav, ui }, settings] = await Promise.all([
    api.content.guide(locale, slug),
    getDictionary(locale),
    api.content.settings(locale),
  ]);
  if (!guide) notFound();
  const content = guidesContent[locale];
  const detail = content.detail;
  const supportPhone = settings.phones.at(-1);

  const facts = [
    ...(guide.durationSec !== null
      ? [
          {
            icon: Clock,
            label: fill(content.card.minutes, {
              count: formatNumber(locale, durationMinutes(guide.durationSec)),
            }),
          },
        ]
      : []),
    {
      icon: ListOrdered,
      label: pluralize(locale, guide.steps.length, content.card.steps),
    },
  ];
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.guides, href: localizePath(locale, routes.guides) },
    { label: guide.title },
  ];
  const graph = await guideGraph(locale, {
    guide,
    breadcrumbs,
    stepAnchor: (index) => `step-${index + 1}`,
  });

  return (
    <article>
      <JsonLd data={graph} />
      <header className="bg-glow bg-dots">
        <div className="container-page flex flex-col gap-4 pt-8 pb-8 sm:pt-12 sm:pb-10">
          <Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="eyebrow">{detail.eyebrow}</span>
            {guide.categories.map((category) => (
              <span
                key={category.slug}
                className="rounded-full bg-primary-soft px-2.5 py-0.5 text-caption font-bold text-primary"
              >
                {category.name}
              </span>
            ))}
          </div>
          <h1 className="max-w-4xl animate-rise font-display text-[1.875rem] leading-[1.35] font-black text-balance text-ink sm:text-[2.5rem]">
            {guide.title}
          </h1>
          <p className="max-w-3xl text-lead leading-8 text-body sm:text-lg sm:leading-9">
            {guide.summary}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-muted">
            {facts.map((fact) => (
              <li key={fact.label} className="inline-flex items-center gap-1.5">
                <fact.icon className="size-4 text-primary" aria-hidden />
                {fact.label}
              </li>
            ))}
            <li className="inline-flex items-center gap-1.5">
              <CalendarCheck className="size-4 text-primary" aria-hidden />
              <time dateTime={guide.updatedAt}>
                {fill(detail.updated, { date: formatDate(locale, guide.updatedAt) })}
              </time>
            </li>
          </ul>
        </div>
      </header>

      <div className="container-page pb-16 sm:pb-20">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
          <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-10">
            {guide.video && (
              <section aria-label={guide.title} className="max-lg:order-1">
                <VideoPlayer
                  video={guide.video}
                  chapters={guide.chapters}
                  title={guide.title}
                  durationSec={guide.durationSec}
                  labels={detail.video}
                  eager
                />
              </section>
            )}
            {guide.steps.length > 0 && (
              <section
                aria-labelledby="guide-steps-title"
                className="flex flex-col gap-5 max-lg:order-3"
              >
                <h2 id="guide-steps-title" className="font-display text-2xl font-black text-ink">
                  {detail.steps.title}
                </h2>
                <GuideSteps slug={guide.slug} steps={guide.steps} copy={detail.steps} />
              </section>
            )}
            <div className="max-lg:order-4">
              <GuideTranscript locale={locale} guide={guide} copy={detail.transcript} />
            </div>
          </div>
          <GuideAside locale={locale} guide={guide} phone={supportPhone} copy={detail} />
        </div>
      </div>
    </article>
  );
}
