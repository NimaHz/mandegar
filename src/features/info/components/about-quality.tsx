import { FilePenLine } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";

import { aboutContent } from "../content";

export function AboutQuality({ locale }: { locale: Locale }) {
  const { quality } = aboutContent[locale];

  return (
    <section aria-labelledby="about-quality" className="container-page flex flex-col gap-10">
      <SectionHeading
        id="about-quality"
        eyebrow={quality.eyebrow}
        title={quality.title}
        description={quality.description}
        action={
          <Badge
            tone="warning"
            size="md"
            className="h-auto max-w-full rounded-xl py-1 whitespace-normal"
          >
            <FilePenLine aria-hidden />
            {quality.placeholder}
          </Badge>
        }
      />
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quality.badges.map(({ icon: Icon, mark, title, body }) => (
          <li
            key={mark}
            className="flex flex-col items-center gap-4 empty-shell px-5 py-8 text-center"
          >
            <span className="relative grid size-24 place-items-center rounded-full border-2 border-dashed border-line-strong bg-surface">
              <span className="absolute inset-2 rounded-full border border-line" aria-hidden />
              <span className="flex flex-col items-center gap-1 text-primary">
                <Icon className="size-6" strokeWidth={1.6} aria-hidden />
                <bdi
                  dir="ltr"
                  className="font-code text-[0.6875rem] font-bold tracking-wider text-ink-soft"
                >
                  {mark}
                </bdi>
              </span>
            </span>
            <span className="flex flex-col gap-1">
              <span className="text-base font-extrabold text-ink">{title}</span>
              <span className="text-label leading-6 text-muted">{body}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
