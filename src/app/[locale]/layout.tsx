import "@/styles/globals.css";

import type { Metadata } from "next";

import { AppProviders } from "@/components/providers/app-providers";
import { ThemeBootScript } from "@/components/providers/theme-boot-script";
import { siteConfig } from "@/config/site";
import { rootViewport } from "@/config/viewport";
import { localeMeta, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { OG_HEIGHT, OG_WIDTH, ogImagePath } from "@/lib/seo/og/targets";
import { api } from "@/services";
import { fontVariables } from "@/styles/fonts";

const siteVerification = (): Metadata["verification"] => {
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  return {
    ...(google && { google }),
    ...(bing && { other: { "msvalidate.01": bing } }),
  };
};

export const viewport = rootViewport;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const [{ site }, { seo }] = await Promise.all([
    getDictionary(locale),
    api.content.settings(locale),
  ]);
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: seo.title, template: `%s | ${site.name}` },
    description: seo.description,
    applicationName: site.name,
    creator: siteConfig.latinName,
    publisher: siteConfig.latinName,
    openGraph: {
      type: "website",
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => localeMeta[other].ogLocale),
      siteName: site.name,
      title: seo.title,
      description: seo.description,
      images: [
        {
          url: ogImagePath(locale, { kind: "page", key: "home" }),
          width: OG_WIDTH,
          height: OG_HEIGHT,
        },
      ],
    },
    twitter: { card: "summary_large_image" },
    robots: {
      googleBot: {
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    formatDetection: { telephone: false, email: false, address: false },
    verification: siteVerification(),
  };
}

export default async function LocaleLayout({ children }: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { hreflang, dir } = localeMeta[locale];

  return (
    <html lang={hreflang} dir={dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeBootScript />
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <AppProviders locale={locale} dictionary={dictionary}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
