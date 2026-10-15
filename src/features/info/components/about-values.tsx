import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";

import { aboutContent } from "../content";

export function AboutValues({ locale }: { locale: Locale }) {
  const { values } = aboutContent[locale];

  return (
    <section aria-labelledby="about-values" className="container-page flex flex-col gap-10">
      <SectionHeading id="about-values" eyebrow={values.eyebrow} title={values.title} />
      <RevealGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {values.items.map(({ icon: Icon, title, body }, index) => (
          <RevealItem
            key={title}
            className="group relative flex gap-5 overflow-hidden card p-6 transition-colors duration-300 hover:border-line-strong sm:p-8"
          >
            <span className="icon-tile size-14 rounded-field transition-colors duration-300 group-hover:bg-primary group-hover:text-on-primary">
              <Icon className="size-6" strokeWidth={1.7} aria-hidden />
            </span>
            <div className="flex min-w-0 flex-col gap-2">
              <h3 className="font-display text-xl font-black text-ink">{title}</h3>
              <p className="text-sm leading-7 text-body sm:text-lead sm:leading-8">{body}</p>
            </div>
            <span
              aria-hidden
              className="pointer-events-none absolute end-4 -bottom-6 font-display text-[6rem] leading-none font-black text-ink/[0.04]"
            >
              {formatNumber(locale, index + 1)}
            </span>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
