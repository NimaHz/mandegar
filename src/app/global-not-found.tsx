import "@/styles/globals.css";

import type { Metadata } from "next";
import { headers } from "next/headers";

import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeBootScript } from "@/components/providers/theme-boot-script";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import {
  defaultLocale,
  isLocale,
  type Locale,
  localeHeader,
  localeMeta,
  locales,
} from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fa } from "@/i18n/dictionaries/fa";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { fontVariables } from "@/styles/fonts";

const dictionaries = { fa, en } as const;

const requestLocale = async (): Promise<Locale> => {
  const locale = (await headers()).get(localeHeader);
  return isLocale(locale) ? locale : defaultLocale;
};

export async function generateMetadata(): Promise<Metadata> {
  const { common, site } = dictionaries[await requestLocale()];
  return { title: `${common.notFoundTitle} | ${site.name}` };
}

function NotFoundCopy({ locale, primary }: { locale: Locale; primary: boolean }) {
  const { common, nav } = dictionaries[locale];
  const { hreflang, dir } = localeMeta[locale];
  const Heading = primary ? "h1" : "h2";

  return (
    <section
      lang={hreflang}
      dir={dir}
      className="flex flex-col items-center gap-3 rounded-card border border-line bg-surface p-6 text-center sm:items-start sm:p-8 sm:text-start"
    >
      <Heading className="font-display text-xl font-black text-ink sm:text-2xl">
        {common.notFoundTitle}
      </Heading>
      <p className="text-sm leading-7 text-body">{common.notFoundDescription}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <a href={localizePath(locale, routes.home)} className={buttonVariants({ size: "sm" })}>
          {common.backHome}
        </a>
        <a
          href={localizePath(locale, routes.products)}
          className={buttonVariants({ variant: "line", size: "sm" })}
        >
          {nav.products}
        </a>
      </div>
    </section>
  );
}

export default async function GlobalNotFound() {
  const locale = await requestLocale();
  const { hreflang, dir } = localeMeta[locale];
  const others = locales.filter((other) => other !== locale);

  return (
    <html lang={hreflang} dir={dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeBootScript />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <main className="bg-glow bg-dots flex min-h-dvh flex-col items-center justify-center gap-10 px-4 py-14 sm:px-6">
          <a
            href={localizePath(locale, routes.home)}
            aria-label={dictionaries[locale].site.name}
            className="flex items-center gap-3"
          >
            <LogoMark className="size-11" />
            <span className="flex flex-col leading-none">
              <span className="font-logo text-2xl font-extrabold text-ink">
                {siteConfig.name[locale]}
              </span>
              <span
                dir="ltr"
                className="mt-1.5 font-logo text-[0.625rem] font-extrabold tracking-[0.34em] text-muted uppercase"
              >
                {siteConfig.latinName}
              </span>
            </span>
          </a>
          <p
            aria-hidden
            dir="ltr"
            className="flex items-center gap-2 font-display text-[6rem] leading-none font-black text-ink sm:text-[8rem]"
          >
            <span>4</span>
            <LogoMark className="size-[5.5rem] sm:size-[7.25rem]" />
            <span>4</span>
          </p>
          <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
            <NotFoundCopy locale={locale} primary />
            {others.map((other) => (
              <NotFoundCopy key={other} locale={other} primary={false} />
            ))}
          </div>
        </main>
      </body>
    </html>
  );
}
