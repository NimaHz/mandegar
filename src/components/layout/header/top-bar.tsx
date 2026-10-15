import { Clock3, Headset, SearchCheck, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { LanguageSwitcher } from "@/components/shared/language-switcher";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

import { layoutContent } from "../content";

interface TopBarProps {
  locale: Locale;
  phone: string | null;
}

const linkClass =
  "inline-flex items-center gap-1.5 text-white/80 transition-colors hover:text-white";

export function TopBar({ locale, phone }: TopBarProps) {
  const { topBar } = layoutContent[locale];

  return (
    <div className="hidden bg-brand-deep text-label text-white/80 lg:block">
      <div className="container-page flex h-10 items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {phone && (
            <a href={`tel:${phone.replace(/\s/g, "")}`} className={linkClass}>
              <Headset className="size-4 text-accent" aria-hidden />
              {topBar.support}
              <bdi dir="ltr" className="font-semibold text-white">
                {phone}
              </bdi>
            </a>
          )}
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-4" aria-hidden />
            {topBar.hours}
          </span>
        </div>
        <div className="flex items-center gap-5">
          <Link href={localizePath(locale, routes.warranty)} className={linkClass}>
            <ShieldCheck className="size-4" aria-hidden />
            {topBar.quickWarranty}
          </Link>
          <Link href={localizePath(locale, routes.track)} className={linkClass}>
            <SearchCheck className="size-4" aria-hidden />
            {topBar.quickTrack}
          </Link>
          <span className="h-4 w-px bg-white/20" aria-hidden />
          <LanguageSwitcher tone="inverse" />
        </div>
      </div>
    </div>
  );
}
