import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { localeMeta, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { languageAlternates, localizePath } from "@/i18n/paths";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    alternates: { canonical: localizePath(locale, "/"), languages: languageAlternates("/") },
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const { site, common } = await getDictionary(locale);
  const alternate = locales.find((other) => other !== locale) ?? locale;
  const { label, hreflang, dir } = localeMeta[alternate];

  return (
    <main className="bg-glow grid min-h-dvh place-items-center px-6 py-16 text-center">
      <div className="flex max-w-xl flex-col items-center gap-5">
        <span className="rounded-full bg-primary-soft px-3 py-1 text-label font-bold text-primary">
          {common.comingSoon}
        </span>
        <h1 className="font-display text-5xl leading-tight font-black text-ink sm:text-6xl">
          {site.name}
        </h1>
        <p className="text-lead leading-8 text-body">{site.slogan}</p>
        <nav aria-label={common.switchLanguage}>
          <Link
            href={localizePath(alternate, "/")}
            hrefLang={hreflang}
            lang={hreflang}
            dir={dir}
            className={buttonVariants({ variant: "line" })}
          >
            {label}
          </Link>
        </nav>
      </div>
    </main>
  );
}
