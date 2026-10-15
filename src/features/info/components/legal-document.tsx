import { FileWarning } from "lucide-react";

import { PageHero } from "@/components/layout/page-hero";
import type { Locale } from "@/i18n/config";
import { formatDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";

import type { LegalDocument as LegalDocumentContent } from "../legal-content";

interface LegalDocumentProps {
  locale: Locale;
  document: LegalDocumentContent;
}

export function LegalDocument({ locale, document }: LegalDocumentProps) {
  const updated = (
    <time dateTime={document.updatedAt}>{formatDate(locale, document.updatedAt)}</time>
  );

  return (
    <>
      <PageHero
        eyebrow={document.eyebrow}
        title={document.title}
        description={document.description}
      >
        <p className="text-label font-semibold text-muted">
          {document.updatedLabel}: <span className="font-bold text-ink-soft">{updated}</span>
        </p>
      </PageHero>
      <div className="container-page grid grid-cols-1 items-start gap-8 pb-16 sm:pb-20 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
        <nav
          aria-label={document.tocLabel}
          className="rounded-card border border-line bg-surface p-4 lg:sticky lg:top-28 lg:p-5"
        >
          <p className="mb-3 text-xs font-extrabold text-muted">{document.tocLabel}</p>
          <ol className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-1">
            {document.sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-start gap-2.5 rounded-control px-2 py-1.5 text-label leading-6 font-semibold text-body transition-colors hover:bg-sunken hover:text-primary"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-soft text-2xs font-extrabold text-primary">
                    {formatNumber(locale, index + 1)}
                  </span>
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <article className="flex max-w-3xl min-w-0 flex-col gap-10">
          <p
            role="note"
            className="flex items-start gap-3 rounded-card border border-warning/30 bg-warning-soft p-4 text-sm leading-7 font-semibold text-warning"
          >
            <FileWarning className="mt-1 size-5 shrink-0" aria-hidden />
            {document.notice}
          </p>
          {document.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              className="flex scroll-mt-28 flex-col gap-3"
            >
              <h2
                id={`${section.id}-title`}
                className="flex items-baseline gap-3 font-display text-xl leading-snug font-black text-ink sm:text-2xl"
              >
                <span aria-hidden className="text-base font-black text-primary">
                  {formatNumber(locale, index + 1)}.
                </span>
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-lead leading-8 text-body sm:text-base sm:leading-9"
                >
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="flex flex-col gap-2 ps-5">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="list-disc text-lead leading-8 text-body marker:text-primary sm:text-base"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          <p className="border-t border-line pt-6 text-xs text-muted">
            {document.updatedLabel}: {updated}
          </p>
        </article>
      </div>
    </>
  );
}
