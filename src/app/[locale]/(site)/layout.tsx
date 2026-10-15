import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteFooter } from "@/components/layout/footer/site-footer";
import { SiteHeader } from "@/components/layout/header/site-header";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export default async function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  const locale = await getLocale();
  const { common } = await getDictionary(locale);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded-control bg-primary px-4 py-3 font-bold text-on-primary focus:not-sr-only focus:fixed focus:start-3 focus:top-3"
      >
        {common.skipToContent}
      </a>
      <SiteHeader locale={locale} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <BottomNav />
    </>
  );
}
