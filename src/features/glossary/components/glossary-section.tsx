import { ArrowLeft, Hash } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { fill } from "@/i18n/fill";

import { termAnchor } from "../config";
import type { GlossaryLetter } from "../terms";

export interface ResolvedLink {
  href: Route;
  label: string;
}

interface GlossarySectionProps {
  group: GlossaryLetter;
  links: (slug: GlossaryLetter["terms"][number]["slug"]) => ResolvedLink[];
  relatedLabel: string;
  copyLabel: string;
}

export function GlossarySection({ group, links, relatedLabel, copyLabel }: GlossarySectionProps) {
  const headingId = `${group.anchor}-title`;

  return (
    <section
      id={group.anchor}
      aria-labelledby={headingId}
      className="grid scroll-mt-36 gap-5 border-t border-line pt-8 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-8 lg:grid-cols-[8rem_minmax(0,1fr)]"
    >
      <h2
        id={headingId}
        className="font-display text-[3rem] leading-none font-black text-primary sm:sticky sm:top-36 sm:self-start lg:text-[4.5rem]"
      >
        {group.label}
      </h2>
      <dl className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {group.terms.map((entry) => {
          const related = links(entry.slug);
          const anchor = termAnchor(entry.slug);
          return (
            <div
              key={entry.slug}
              id={anchor}
              className="group/term flex scroll-mt-36 flex-col gap-3 card p-5 transition-[border-color,box-shadow] duration-300 target:border-primary target:shadow-lift target:ring-3 target:ring-primary/15 sm:p-6"
            >
              <dt className="flex items-start justify-between gap-3">
                <span className="font-display text-lg leading-snug font-black text-ink">
                  {entry.term}
                </span>
                <a
                  href={`#${anchor}`}
                  aria-label={fill(copyLabel, { term: entry.term })}
                  className="icon-btn size-8 opacity-60 transition-opacity group-hover/term:opacity-100 focus-visible:opacity-100"
                >
                  <Hash className="size-4" aria-hidden />
                </a>
              </dt>
              <dd className="text-sm leading-7 text-body sm:text-lead sm:leading-8">
                {entry.definition}
              </dd>
              {related.length > 0 && (
                <dd className="mt-auto flex flex-wrap items-center gap-2 border-t border-line pt-3">
                  <span className="text-xs font-bold text-muted">{relatedLabel}:</span>
                  {related.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group/link inline-flex h-8 items-center gap-1 rounded-full bg-primary-soft px-3 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-on-primary"
                    >
                      {link.label}
                      <ArrowLeft className="size-3.5 ltr:rotate-180" aria-hidden />
                    </Link>
                  ))}
                </dd>
              )}
            </div>
          );
        })}
      </dl>
    </section>
  );
}
