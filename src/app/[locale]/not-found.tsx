import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LogoMark } from "@/components/brand/logo-mark";
import { layoutContent } from "@/components/layout/content";
import { buttonVariants } from "@/components/ui/button";
import { QuickLinks } from "@/features/info/components/quick-links";
import { StatusScreen } from "@/features/info/components/status-screen";
import { statusContent } from "@/features/info/status-content";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";

export async function generateMetadata(): Promise<Metadata> {
  const { common } = await getDictionary(await getLocale());
  return { title: common.notFoundTitle };
}

export default async function NotFound() {
  const locale = await getLocale();
  const { common, nav } = await getDictionary(locale);
  const status = statusContent[locale];
  const four = formatNumber(locale, 4);

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="container-page flex h-20 shrink-0 items-center border-b border-line">
        <Logo locale={locale} size="md" homeLabel={layoutContent[locale].homeLabel} />
      </header>
      <StatusScreen
        className="flex-1"
        visual={
          <p
            aria-hidden
            dir="ltr"
            className="flex items-center gap-2 font-display text-[6rem] leading-none font-black text-ink sm:text-[8.5rem]"
          >
            <span>{four}</span>
            <LogoMark className="size-[5.5rem] sm:size-[7.75rem]" />
            <span>{four}</span>
          </p>
        }
        title={common.notFoundTitle}
        description={common.notFoundDescription}
        actions={
          <form
            role="search"
            action={localizePath(locale, routes.products)}
            method="get"
            className="flex h-13 w-full max-w-md items-center gap-2 field-shell p-1.5 ps-4"
          >
            <label className="flex h-full min-w-0 flex-1 items-center gap-2.5 text-muted">
              <Search className="size-5 shrink-0" strokeWidth={1.8} aria-hidden />
              <span className="sr-only">{status.notFoundSearch}</span>
              <input
                type="search"
                name="q"
                placeholder={common.searchPlaceholder}
                enterKeyHint="search"
                autoComplete="off"
                className="h-full min-w-0 flex-1 bg-transparent text-lead text-ink outline-none"
              />
            </label>
            <button
              type="submit"
              className={buttonVariants({ size: "sm", className: "h-full px-4" })}
            >
              {common.search}
            </button>
          </form>
        }
      >
        <div className="flex flex-col items-center gap-8">
          <QuickLinks locale={locale} nav={nav} title={status.notFoundLinks} />
          <Link
            href={localizePath(locale, routes.home)}
            className={buttonVariants({ variant: "line" })}
          >
            {common.backHome}
          </Link>
        </div>
      </StatusScreen>
    </main>
  );
}
