import { FilePenLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";
import { jalaliToGregorianYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";

import { aboutContent } from "../content";

const displayYear = (locale: Locale, jalaliYear: number) =>
  formatNumber(locale, locale === "fa" ? jalaliYear : jalaliToGregorianYear(jalaliYear), {
    useGrouping: false,
  });

export function AboutStory({ locale }: { locale: Locale }) {
  const { story } = aboutContent[locale];

  return (
    <section
      aria-labelledby="about-story"
      className="container-page grid gap-12 lg:grid-cols-2 lg:gap-20"
    >
      <div className="flex flex-col items-start gap-5 lg:sticky lg:top-28 lg:self-start">
        <p className="eyebrow">{story.eyebrow}</p>
        <h2
          id="about-story"
          className="font-display text-[1.875rem] leading-snug font-black text-balance text-ink sm:text-[2.5rem]"
        >
          {story.title}
        </h2>
        <Badge
          tone="warning"
          size="md"
          className="h-auto max-w-full rounded-xl py-1 whitespace-normal"
        >
          <FilePenLine aria-hidden />
          {story.placeholder}
        </Badge>
        {story.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-lead leading-8 text-pretty text-body sm:text-base sm:leading-9"
          >
            {paragraph}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-6">
        <h3 className="text-label font-extrabold text-muted">{story.milestonesLabel}</h3>
        <ol className="relative flex flex-col gap-9 border-s-2 border-line ps-8">
          {story.milestones.map((milestone, index) => (
            <li key={milestone.year} className="relative flex flex-col gap-1.5">
              <span
                aria-hidden
                className={
                  index === story.milestones.length - 1
                    ? "absolute -start-[2.6rem] top-2 size-4 rounded-full bg-accent ring-4 ring-canvas"
                    : "absolute -start-[2.6rem] top-2 size-4 rounded-full border-2 border-primary bg-canvas ring-4 ring-canvas"
                }
              />
              <span className="font-display text-[2rem] leading-none font-black text-primary">
                {displayYear(locale, milestone.year)}
              </span>
              <span className="mt-1 text-base font-extrabold text-ink">{milestone.title}</span>
              <span className="text-sm leading-7 text-body">{milestone.body}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
