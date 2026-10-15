import { ArrowLeft, LifeBuoy } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import type { ContactContent } from "../content";

interface AfterSalesNoteProps {
  locale: Locale;
  content: ContactContent["afterSales"];
  className?: string;
}

export function AfterSalesNote({ locale, content, className }: AfterSalesNoteProps) {
  return (
    <section
      aria-labelledby="after-sales-note"
      className={cn(
        "relative isolate flex gap-4 overflow-hidden rounded-card border border-primary/25 bg-primary-soft/60 p-5",
        className,
      )}
    >
      <span className="icon-tile size-11 rounded-field bg-raised shadow-card">
        <LifeBuoy className="size-5" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <h2 id="after-sales-note" className="text-sm font-extrabold text-ink">
          {content.title}
        </h2>
        <p className="text-label leading-6 text-body">{content.body}</p>
        <Link
          href={localizePath(locale, routes.serviceRequest)}
          className="group mt-1 inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary"
        >
          {content.action}
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
