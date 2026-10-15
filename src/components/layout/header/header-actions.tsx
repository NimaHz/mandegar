"use client";

import { Columns3, Search, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { useCompareStore } from "@/stores/compare";
import { useStoresHydrated } from "@/stores/hydration";

import { layoutContent } from "../content";
import { iconButtonClass } from "./nav-styles";
import { useSearchDialog } from "./use-search-dialog";

export function HeaderActions() {
  const locale = useLocale();
  const { header } = layoutContent[locale];
  const openSearch = useSearchDialog((state) => state.open);
  const hydrated = useStoresHydrated();
  const compareCount = useCompareStore((state) => state.slugs.length);
  const shownCount = hydrated ? compareCount : 0;

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={openSearch}
        aria-label={header.search}
        className={iconButtonClass}
      >
        <Search className="size-5" strokeWidth={1.8} aria-hidden />
      </button>
      <Link
        href={localizePath(locale, routes.compare)}
        aria-label={`${header.compare}${shownCount ? ` (${formatNumber(locale, shownCount)})` : ""}`}
        className={cn(iconButtonClass, "max-sm:hidden")}
      >
        <Columns3 className="size-5" strokeWidth={1.8} aria-hidden />
        {shownCount > 0 && (
          <span className="absolute -end-0.5 -top-0.5 grid min-w-4.5 place-items-center rounded-full bg-accent px-1 text-2xs leading-4.5 font-bold text-on-accent">
            {formatNumber(locale, shownCount)}
          </span>
        )}
      </Link>
      <ThemeToggle className="max-lg:hidden" />
      <Link
        href={localizePath(locale, routes.warranty)}
        className={buttonVariants({ size: "sm", className: "group h-10 gap-2 px-4 max-md:hidden" })}
      >
        <ShieldCheck
          className="size-4.5 transition-transform duration-300 group-hover:scale-110"
          aria-hidden
        />
        {header.warrantyCta}
      </Link>
      <Link
        href={localizePath(locale, routes.warranty)}
        aria-label={header.warrantyCta}
        className={cn(iconButtonClass, "text-primary md:hidden")}
      >
        <ShieldCheck className="size-5" strokeWidth={1.8} aria-hidden />
      </Link>
    </div>
  );
}
