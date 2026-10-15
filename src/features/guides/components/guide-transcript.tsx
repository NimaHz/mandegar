import { ChevronDown, FileText } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";
import type { GuideDetail } from "@/types/content";

import type { GuidesContent } from "../content";
import { chapterClock } from "../format";

interface GuideTranscriptProps {
  locale: Locale;
  guide: GuideDetail;
  copy: GuidesContent["detail"]["transcript"];
}

export function GuideTranscript({ locale, guide, copy }: GuideTranscriptProps) {
  return (
    <section aria-labelledby="guide-transcript-title">
      <details className="group card bg-raised">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
          <span className="inline-flex items-center gap-3">
            <span className="icon-tile size-10">
              <FileText className="size-4.5" aria-hidden />
            </span>
            <span className="flex flex-col">
              <h2 id="guide-transcript-title" className="text-base font-extrabold text-ink">
                {copy.title}
              </h2>
              <span className="text-xs text-muted">{copy.toggle}</span>
            </span>
          </span>
          <ChevronDown
            className="size-5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180"
            aria-hidden
          />
        </summary>
        <div className="flex flex-col gap-5 border-t border-line px-5 py-5 text-sm leading-8 text-body">
          <p>{guide.summary}</p>
          {guide.chapters.length > 0 && (
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-ink">{copy.chapters}</h3>
              <ul className="flex flex-col gap-1">
                {guide.chapters.map((chapter) => (
                  <li key={`${chapter.startSec}-${chapter.title}`}>
                    <bdi dir="ltr" className="font-code text-xs font-bold text-primary">
                      {chapterClock(locale, chapter.startSec)}
                    </bdi>{" "}
                    {chapter.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ol className="flex flex-col gap-3">
            {guide.steps.map((step, index) => (
              <li key={step.title}>
                <strong className="text-ink">
                  {formatNumber(locale, index + 1)}. {step.title}
                </strong>{" "}
                {step.body}
              </li>
            ))}
          </ol>
        </div>
      </details>
    </section>
  );
}
