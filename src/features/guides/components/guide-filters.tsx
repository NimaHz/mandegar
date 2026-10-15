import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";

import { serializeGuidesSearchParams } from "../search-params";

interface GuideFiltersProps {
  locale: Locale;
  label: string;
  allLabel: string;
  total: number;
  active: string | null;
  categories: { slug: string; name: string; count: number }[];
}

const chipClass =
  "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-label font-semibold transition-colors";

export function GuideFilters({
  locale,
  label,
  allLabel,
  total,
  active,
  categories,
}: GuideFiltersProps) {
  const path = localizePath(locale, routes.guides);
  const options = [{ slug: null, name: allLabel, count: total }, ...categories];

  return (
    <nav aria-label={label} className="-mx-4 scrollbar-none overflow-x-auto px-4">
      <ul className="flex w-max gap-2 sm:w-auto sm:flex-wrap sm:justify-center">
        {options.map((option) => {
          const current = option.slug === active;
          return (
            <li key={option.slug ?? "all"}>
              <Link
                href={{
                  pathname: path,
                  search: serializeGuidesSearchParams({ category: option.slug }),
                }}
                scroll={false}
                aria-current={current ? "page" : undefined}
                className={cn(
                  chipClass,
                  current
                    ? "border-inverse bg-inverse text-on-inverse"
                    : "border-line-strong bg-surface text-ink hover:border-ink",
                )}
              >
                {option.name}
                <span
                  className={cn(
                    "grid min-w-5 place-items-center rounded-full px-1.5 text-caption font-extrabold",
                    current ? "bg-on-inverse/15" : "bg-chip text-ink-soft",
                  )}
                >
                  {formatNumber(locale, option.count)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
