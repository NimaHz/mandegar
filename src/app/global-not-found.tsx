import "@/styles/globals.css";

import type { Metadata } from "next";

import { LogoMark } from "@/components/brand/logo-mark";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { type Locale, localeMeta } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fa } from "@/i18n/dictionaries/fa";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { themeBootScript } from "@/lib/theme";
import { fontVariables } from "@/styles/fonts";

export const metadata: Metadata = {
  title: `${fa.common.notFoundTitle} | ${fa.site.name}`,
  robots: { index: false, follow: true },
};

const dictionaries = { fa, en } as const;

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

export default function GlobalNotFound() {
  return (
    <html
      lang={localeMeta.fa.hreflang}
      dir={localeMeta.fa.dir}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <main className="bg-glow bg-dots flex min-h-dvh flex-col items-center justify-center gap-10 px-4 py-14 sm:px-6">
          <a
            href={localizePath("fa", routes.home)}
            aria-label={fa.site.name}
            className="flex items-center gap-3"
          >
            <LogoMark className="size-11" />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl font-extrabold text-ink">
                {siteConfig.name.fa}
              </span>
              <span
                dir="ltr"
                className="mt-1 font-code text-[0.625rem] font-medium tracking-[0.32em] text-muted uppercase"
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
            <NotFoundCopy locale="fa" primary />
            <NotFoundCopy locale="en" primary={false} />
          </div>
        </main>
      </body>
    </html>
  );
}
