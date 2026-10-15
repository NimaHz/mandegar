import { CalendarDays, Clock3 } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";

import { blogContent } from "../content";

interface PostMetaProps {
  locale: Locale;
  publishedAt: string;
  readingMinutes: number;
  className?: string;
}

export function PostMeta({ locale, publishedAt, readingMinutes, className }: PostMetaProps) {
  const content = blogContent[locale];

  return (
    <span
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        <CalendarDays className="size-3.5" aria-hidden />
        <span className="sr-only">{content.published}: </span>
        <time dateTime={publishedAt}>{formatDate(locale, publishedAt)}</time>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <Clock3 className="size-3.5" aria-hidden />
        {fill(content.readingTime, { count: formatNumber(locale, readingMinutes) })}
      </span>
    </span>
  );
}
