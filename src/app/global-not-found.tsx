import "@/styles/globals.css";

import type { Metadata } from "next";

import { buttonVariants } from "@/components/ui/button";
import { localeMeta } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fa } from "@/i18n/dictionaries/fa";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { themeBootScript } from "@/lib/theme";
import { fontVariables } from "@/styles/fonts";

export const metadata: Metadata = {
  title: `${fa.common.notFoundTitle} | ${fa.site.name}`,
};

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
        <main className="bg-glow flex min-h-dvh flex-col items-center justify-center gap-8 px-6 py-16 text-center">
          <p className="font-display text-7xl leading-none font-black text-ink">
            {formatNumber("fa", 404, { useGrouping: false })}
          </p>
          <section className="flex flex-col items-center gap-3">
            <h1 className="text-xl font-extrabold text-ink">{fa.common.notFoundTitle}</h1>
            <p className="max-w-sm text-sm leading-7 text-body">{fa.common.notFoundDescription}</p>
            <a href={localizePath("fa", "/")} className={buttonVariants()}>
              {fa.common.backHome}
            </a>
          </section>
          <section
            lang={localeMeta.en.hreflang}
            dir={localeMeta.en.dir}
            className="flex flex-col items-center gap-3 border-t border-line pt-8"
          >
            <h2 className="text-lg font-extrabold text-ink">{en.common.notFoundTitle}</h2>
            <p className="max-w-sm text-sm leading-7 text-body">{en.common.notFoundDescription}</p>
            <a href={localizePath("en", "/")} className={buttonVariants({ variant: "line" })}>
              {en.common.backHome}
            </a>
          </section>
        </main>
      </body>
    </html>
  );
}
