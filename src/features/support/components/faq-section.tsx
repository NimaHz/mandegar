import { ArrowLeft, ChevronDown } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Markdown } from "@/components/shared/markdown";
import { SectionHeading } from "@/components/ui/section-heading";
import { cn } from "@/lib/cn";
import type { Faq } from "@/types/content";

interface FaqSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  faqs: Faq[];
  more?: { href: Route; label: string };
  className?: string;
}

export function FaqSection({ id, eyebrow, title, faqs, more, className }: FaqSectionProps) {
  if (faqs.length === 0) return null;

  return (
    <section aria-labelledby={id} className={cn("container-page section-y", className)}>
      <div className="mx-auto flex max-w-3xl flex-col gap-8">
        <SectionHeading id={id} eyebrow={eyebrow} title={title} align="center" />
        <div className="divide-y divide-line overflow-hidden card bg-raised shadow-card">
          {faqs.map((faq, index) => (
            <details key={faq.id} open={index === 0} className="group">
              <summary className="flex min-h-15 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-start text-lead font-bold text-ink transition-colors hover:bg-surface [&::-webkit-details-marker]:hidden">
                <h3>{faq.question}</h3>
                <ChevronDown
                  className="size-4.5 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180 group-open:text-primary"
                  aria-hidden
                />
              </summary>
              <Markdown source={faq.answer} className="px-5 pb-5 text-sm leading-7" />
            </details>
          ))}
        </div>
        {more && (
          <Link
            href={more.href}
            className="group inline-flex items-center gap-1.5 self-center text-sm font-bold text-primary"
          >
            {more.label}
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        )}
      </div>
    </section>
  );
}
