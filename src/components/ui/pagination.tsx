import { ChevronsLeft, ChevronsRight } from "lucide-react";
import Link from "next/link";
import type { UrlObject } from "url";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fa";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

type PaginationLabels = Pick<
  Dictionary["ui"],
  "paginationLabel" | "paginationPrevious" | "paginationNext" | "paginationLast" | "paginationPage"
>;

interface PaginationProps {
  page: number;
  pageCount: number;
  createHref: (page: number) => UrlObject;
  locale: Locale;
  labels: PaginationLabels;
}

const visiblePages = (page: number, pageCount: number) => {
  const start = Math.max(1, Math.min(page - 1, pageCount - 2));
  return Array.from({ length: Math.min(3, pageCount) }, (_, index) => start + index);
};

const cell =
  "grid h-10 min-w-10 place-items-center px-3 text-sm font-bold transition-colors hover:bg-primary-soft";

const arrowClass =
  "grid size-10 place-items-center rounded-control border border-ink bg-surface transition-colors hover:bg-primary-soft";

export function Pagination({ page, pageCount, createHref, locale, labels }: PaginationProps) {
  if (pageCount <= 1) return null;
  const pages = visiblePages(page, pageCount);

  return (
    <nav aria-label={labels.paginationLabel} className="flex items-center justify-center gap-2">
      {page > 1 && (
        <Link
          href={createHref(page - 1)}
          aria-label={labels.paginationPrevious}
          className={arrowClass}
        >
          <ChevronsRight className="size-4 ltr:rotate-180" aria-hidden />
        </Link>
      )}
      <div className="flex overflow-hidden rounded-control border border-ink bg-surface">
        {pages.map((value) => {
          const number = formatNumber(locale, value);
          return (
            <Link
              key={value}
              href={createHref(value)}
              aria-label={fill(labels.paginationPage, { page: number })}
              aria-current={value === page ? "page" : undefined}
              className={cn(
                cell,
                "border-s border-ink first:border-s-0",
                value === page && "bg-inverse text-on-inverse hover:bg-inverse",
              )}
            >
              {number}
            </Link>
          );
        })}
        {!pages.includes(pageCount) && (
          <Link href={createHref(pageCount)} className={cn(cell, "border-s border-ink px-4")}>
            {labels.paginationLast}
          </Link>
        )}
      </div>
      {page < pageCount && (
        <Link href={createHref(page + 1)} aria-label={labels.paginationNext} className={arrowClass}>
          <ChevronsLeft className="size-4 ltr:rotate-180" aria-hidden />
        </Link>
      )}
    </nav>
  );
}
