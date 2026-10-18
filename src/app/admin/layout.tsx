import "@/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AppProviders } from "@/components/providers/app-providers";
import { ThemeBootScript } from "@/components/providers/theme-boot-script";
import { siteConfig } from "@/config/site";
import { rootViewport } from "@/config/viewport";
import { adminContent } from "@/features/admin/content";
import { fa } from "@/i18n/dictionaries/fa";
import { fill } from "@/i18n/fill";
import { fontVariables } from "@/styles/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: fill(adminContent.shell.metaTitle, { name: siteConfig.name.fa }),
    template: `%s | ${adminContent.shell.title}`,
  },
  applicationName: siteConfig.name.fa,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
  formatDetection: { telephone: false },
};

export const viewport = rootViewport;

export default function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      data-scroll-behavior="smooth"
      lang="fa"
      dir="rtl"
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        <ThemeBootScript />
      </head>
      <body className="min-h-dvh overflow-x-clip" suppressHydrationWarning>
        <AppProviders locale="fa" dictionary={fa} toastPlacement="top">
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
