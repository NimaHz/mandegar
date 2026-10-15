import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { ProvinceCount } from "@/types/content";

import { serializeServiceCentersSearchParams, type ServiceCentersFilters } from "../search-params";

interface ProvinceSummaryProps {
  locale: Locale;
  title: string;
  provinces: ProvinceCount[];
  filters: ServiceCentersFilters;
}

export function ProvinceSummary({ locale, title, provinces, filters }: ProvinceSummaryProps) {
  if (provinces.length === 0) return null;
  const path = localizePath(locale, routes.serviceCenters);

  return (
    <nav aria-label={title} className="flex flex-col gap-3">
      <h2 className="text-sm font-extrabold text-ink">{title}</h2>
      <ul className="flex flex-wrap gap-2">
        {provinces.map((province) => {
          const current = province.code === filters.province;
          return (
            <li key={province.code}>
              <Link
                href={{
                  pathname: path,
                  search: serializeServiceCentersSearchParams({
                    ...filters,
                    province: current ? null : province.code,
                  }),
                }}
                scroll={false}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-label font-semibold transition-colors",
                  current
                    ? "border-inverse bg-inverse text-on-inverse"
                    : "border-line-strong bg-surface text-ink hover:border-ink",
                )}
              >
                {province.name}
                <span
                  className={cn(
                    "grid min-w-5 place-items-center rounded-full px-1.5 text-caption font-extrabold",
                    current ? "bg-on-inverse/15" : "bg-primary-soft text-primary",
                  )}
                >
                  {formatNumber(locale, province.count)}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
