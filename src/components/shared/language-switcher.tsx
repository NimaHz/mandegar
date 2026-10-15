"use client";

import { Languages } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { localeMeta, locales } from "@/i18n/config";
import { useLocale } from "@/i18n/locale-provider";
import { localizePath, stripLocalePrefix } from "@/i18n/paths";
import { cn } from "@/lib/cn";

type LanguageSwitcherTone = "default" | "inverse";

interface LanguageSwitcherProps {
  tone?: LanguageSwitcherTone;
  className?: string;
}

const toneClass: Record<LanguageSwitcherTone, string> = {
  default: "h-9 rounded-control px-3 text-sm text-ink-soft hover:bg-sunken hover:text-ink",
  inverse: "text-white/80 hover:text-white",
};

function SwitcherLink({
  query,
  tone = "default",
  className,
}: LanguageSwitcherProps & { query: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const target = locales.find((other) => other !== locale) ?? locale;
  const { label, hreflang, dir } = localeMeta[target];
  const path = localizePath(target, stripLocalePrefix(pathname));
  const href = (query ? `${path}?${query}` : path) as Route;

  return (
    <Link
      href={href}
      hrefLang={hreflang}
      lang={hreflang}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 font-semibold transition-colors",
        toneClass[tone],
        className,
      )}
    >
      <Languages className="size-4" aria-hidden />
      <span dir={dir}>{label}</span>
    </Link>
  );
}

function SwitcherWithQuery(props: LanguageSwitcherProps) {
  const query = useSearchParams().toString();
  return <SwitcherLink {...props} query={query} />;
}

export function LanguageSwitcher(props: LanguageSwitcherProps) {
  return (
    <Suspense fallback={<SwitcherLink {...props} query="" />}>
      <SwitcherWithQuery {...props} />
    </Suspense>
  );
}
