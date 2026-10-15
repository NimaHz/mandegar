import "@/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site";
import { rootViewport } from "@/config/viewport";
import { themeBootScript } from "@/lib/theme";
import { fontVariables } from "@/styles/fonts";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `پنل مدیریت ${siteConfig.name.fa}`, template: "%s | پنل مدیریت" },
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
    <html lang="fa" dir="rtl" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh overflow-x-clip">{children}</body>
    </html>
  );
}
