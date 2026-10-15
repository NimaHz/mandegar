import Link from "next/link";

import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { LogoMark } from "./logo-mark";

interface LogoProps {
  locale: Locale;
  size?: "sm" | "md" | "lg";
  tone?: "color" | "light";
  homeLabel: string;
  className?: string;
}

const sizes = {
  sm: { mark: "size-8", name: "text-xl", latin: "text-[0.5rem]" },
  md: { mark: "size-9", name: "text-2xl", latin: "text-[0.5625rem]" },
  lg: { mark: "size-12", name: "text-[2rem]", latin: "text-[0.6875rem]" },
} as const;

export function Logo({ locale, size = "md", tone = "color", homeLabel, className }: LogoProps) {
  const name = siteConfig.name[locale];
  const light = tone === "light";

  return (
    <Link
      href={localizePath(locale, routes.home)}
      aria-label={homeLabel}
      className={cn("group inline-flex shrink-0 items-center gap-2.5", className)}
    >
      <LogoMark
        tone={light ? "mono" : "color"}
        className={cn(
          sizes[size].mark,
          light && "text-white",
          "transition-transform duration-1000 ease-(--ease-out-expo) group-hover:rotate-[360deg]",
        )}
      />
      <span aria-hidden className="flex flex-col leading-none">
        <span
          className={cn(
            "font-logo font-extrabold",
            sizes[size].name,
            light ? "text-white" : "text-ink",
          )}
        >
          {name}
        </span>
        {locale === "fa" && (
          <span
            dir="ltr"
            className={cn(
              "mt-1.5 font-logo font-extrabold tracking-[0.34em] uppercase",
              sizes[size].latin,
              light ? "text-white/70" : "text-muted",
            )}
          >
            {siteConfig.latinName}
          </span>
        )}
      </span>
    </Link>
  );
}
