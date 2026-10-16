"use client";

import { Plus, Search, SearchX, X } from "lucide-react";
import { useDeferredValue, useId, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { includesQuery } from "@/lib/persian";
import type { Faq, FaqGroup } from "@/types/content";

import { faqGroupIcons } from "../config";
import type { FaqContent } from "../content";

interface FaqSection {
  group: FaqGroup;
  items: (Faq & { answerHtml: string })[];
}

interface FaqBrowserProps {
  sections: FaqSection[];
  content: FaqContent;
}

const faqAnchor = (group: FaqGroup) => `faq-${group}`;

export function FaqBrowser({ sections, content }: FaqBrowserProps) {
  const locale = useLocale();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const searching = deferredQuery.trim().length > 0;

  const visible = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((faq) => includesQuery(deferredQuery, faq.question, faq.answer)),
    }))
    .filter((section) => section.items.length > 0);
  const total = visible.reduce((sum, section) => sum + section.items.length, 0);

  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12">
      <nav
        aria-label={content.navLabel}
        className="-mx-4 scrollbar-none overflow-x-auto px-4 lg:sticky lg:top-28 lg:mx-0 lg:overflow-visible lg:px-0"
      >
        <p className="mb-3 hidden text-xs font-extrabold text-muted lg:block">{content.navLabel}</p>
        <ul className="flex gap-2 lg:flex-col lg:gap-1">
          {sections.map(({ group, items }) => {
            const Icon = faqGroupIcons[group];
            const count = visible.find((section) => section.group === group)?.items.length ?? 0;
            return (
              <li key={group} className="shrink-0">
                <a
                  href={`#${faqAnchor(group)}`}
                  aria-disabled={count === 0 ? true : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-control border border-line bg-surface px-3 py-2 text-label font-bold text-ink-soft transition-colors hover:border-line-strong hover:text-primary lg:border-transparent lg:bg-transparent lg:hover:bg-surface",
                    count === 0 && "pointer-events-none opacity-45",
                  )}
                >
                  <Icon className="size-4 shrink-0 text-primary" aria-hidden />
                  <span className="flex-1">{content.groups[group].title}</span>
                  <span className="rounded-full bg-chip px-2 text-caption font-extrabold text-ink-soft tabular-nums">
                    {formatNumber(locale, searching ? count : items.length)}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={searchId} className="sr-only">
            {content.searchLabel}
          </label>
          <div className="flex h-13 items-center gap-2 field-shell px-4">
            <Search className="size-5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={content.searchPlaceholder}
              autoComplete="off"
              enterKeyHint="search"
              className="h-full min-w-0 flex-1 bg-transparent text-lead text-ink outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={content.clearSearch}
                className="icon-btn size-9"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
          <p role="status" className="min-h-5 text-label font-semibold text-muted">
            {searching ? fill(content.resultCount, { count: formatNumber(locale, total) }) : ""}
          </p>
        </div>

        {visible.length === 0 && (
          <EmptyState
            icon={SearchX}
            title={content.emptyTitle}
            description={content.emptyDescription}
          />
        )}

        {sections.map(({ group }) => {
          const section = visible.find((entry) => entry.group === group);
          const Icon = faqGroupIcons[group];
          const headingId = `${faqAnchor(group)}-title`;
          return (
            <section
              key={group}
              id={faqAnchor(group)}
              aria-labelledby={headingId}
              hidden={!section}
              className="scroll-mt-28 card p-5 sm:p-7"
            >
              <div className="flex items-center gap-4 border-b border-line pb-5">
                <span className="icon-tile size-12 rounded-field">
                  <Icon className="size-5.5" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 id={headingId} className="font-display text-xl font-black text-ink">
                    {content.groups[group].title}
                  </h2>
                  <p className="text-label text-muted">{content.groups[group].description}</p>
                </div>
              </div>
              <div className="divide-y divide-line">
                {section?.items.map((faq) => (
                  <details
                    key={faq.id}
                    open={searching || undefined}
                    className="group/faq [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-control py-4 text-start text-base leading-8 font-bold text-ink transition-colors hover:text-primary">
                      <span>{faq.question}</span>
                      <span
                        aria-hidden
                        className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-chip text-ink-soft transition-[rotate,background-color,color] duration-300 group-open/faq:rotate-45 group-open/faq:bg-primary group-open/faq:text-on-primary"
                      >
                        <Plus className="size-4" />
                      </span>
                    </summary>
                    <div
                      className="prose-mandegar pe-11 pb-5 text-sm leading-8 sm:text-lead"
                      dangerouslySetInnerHTML={{ __html: faq.answerHtml }}
                    />
                  </details>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
