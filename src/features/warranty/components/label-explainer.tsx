import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";

import type { WarrantyContent } from "../content";
import { LabelDiagram } from "./label-diagram";

interface LabelExplainerProps {
  locale: Locale;
  content: WarrantyContent["label"];
}

export function LabelExplainer({ locale, content }: LabelExplainerProps) {
  return (
    <section aria-labelledby="warranty-label-title" className="container-page section-y">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="flex flex-col gap-8">
          <SectionHeading
            id="warranty-label-title"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <ol className="flex flex-col gap-5">
            {content.steps.map((step, index) => (
              <li key={step.title} className="flex items-start gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-display text-base font-black text-on-accent">
                  {formatNumber(locale, index + 1)}
                </span>
                <div className="flex flex-col gap-1 pt-1.5">
                  <h3 className="text-base font-extrabold text-ink">{step.title}</h3>
                  <p className="text-sm leading-7 text-body">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <Reveal>
          <LabelDiagram locale={locale} content={content} />
        </Reveal>
      </div>
    </section>
  );
}
