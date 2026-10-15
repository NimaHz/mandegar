import "@/styles/globals.css";

import type { Metadata } from "next";

import { siteConfig } from "@/config/site";
import { rootViewport } from "@/config/viewport";
import { localeMeta, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { themeBootScript } from "@/lib/theme";
import { fontVariables } from "@/styles/fonts";

export const dynamicParams = false;

export const viewport = rootViewport;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { site } = await getDictionary(locale);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: site.title, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    creator: siteConfig.latinName,
    openGraph: {
      type: "website",
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => localeMeta[other].ogLocale),
      siteName: site.name,
      title: site.title,
      description: site.description,
    },
    robots: { index: true, follow: true },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const { hreflang, dir } = localeMeta[locale];

  return (
    <html lang={hreflang} dir={dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">{children}</body>
    </html>
  );
}
