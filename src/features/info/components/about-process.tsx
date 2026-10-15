import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";

import { aboutContent } from "../content";

export function AboutProcess({ locale }: { locale: Locale }) {
  const { process } = aboutContent[locale];

  return (
    <section aria-labelledby="about-process" className="container-page flex flex-col gap-12">
      <SectionHeading
        id="about-process"
        eyebrow={process.eyebrow}
        title={process.title}
        description={process.description}
      />
      <ol className="grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-6">
        {process.steps.map(({ icon: Icon, title, body }, index) => (
          <li key={title} className="relative flex gap-5 lg:flex-col lg:gap-6">
            {index < process.steps.length - 1 && (
              <span
                aria-hidden
                className="absolute start-7 top-16 -bottom-8 w-px bg-linear-to-b from-primary/50 to-line lg:start-18 lg:end-[-1.5rem] lg:top-7 lg:bottom-auto lg:h-px lg:w-auto lg:bg-linear-to-r lg:rtl:bg-linear-to-l"
              />
            )}
            <span className="relative grid size-14 shrink-0 place-items-center rounded-full border border-line-strong bg-raised text-primary shadow-card">
              <Icon className="size-6" strokeWidth={1.7} aria-hidden />
              <span
                aria-hidden
                className="absolute -end-1 -top-1 grid size-6 place-items-center rounded-full bg-inverse font-display text-xs font-black text-on-inverse"
              >
                {formatNumber(locale, index + 1)}
              </span>
            </span>
            <div className="flex flex-col gap-2 pt-1 lg:pt-0">
              <h3 className="font-display text-xl font-black text-ink">{title}</h3>
              <p className="text-sm leading-7 text-body">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
