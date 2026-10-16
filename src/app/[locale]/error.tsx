"use client";

import { Logo } from "@/components/brand/logo";
import { layoutContent } from "@/components/layout/content";
import { ErrorScreen, type ErrorScreenProps } from "@/features/info/components/error-screen";
import { useLocale } from "@/i18n/locale-provider";

export default function LocaleError({ error, retry }: ErrorScreenProps) {
  const locale = useLocale();

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="container-page flex h-20 shrink-0 items-center border-b border-line">
        <Logo locale={locale} size="md" homeLabel={layoutContent[locale].homeLabel} />
      </header>
      <ErrorScreen error={error} retry={retry} className="flex-1" />
    </main>
  );
}
