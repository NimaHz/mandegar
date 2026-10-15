import { WifiOff } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { layoutContent } from "@/components/layout/content";
import { buttonVariants } from "@/components/ui/button";
import { QuickLinks } from "@/features/info/components/quick-links";
import { RetryButton } from "@/features/info/components/retry-button";
import { StatusScreen } from "@/features/info/components/status-screen";
import { statusContent } from "@/features/info/status-content";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { common } = await getDictionary(locale);
  return pageMetadata({
    locale,
    path: routes.offline,
    title: statusContent[locale].offlineMeta,
    description: common.offlineDescription,
    noindex: true,
  });
}

export default async function OfflinePage() {
  const locale = await getLocale();
  const { common, nav } = await getDictionary(locale);

  return (
    <StatusScreen
      visual={
        <div className="flex flex-col items-center gap-6">
          <Logo locale={locale} size="lg" homeLabel={layoutContent[locale].homeLabel} />
          <span className="icon-tile size-16 rounded-card bg-raised shadow-card ring-1 ring-line">
            <WifiOff className="size-7" strokeWidth={1.6} aria-hidden />
          </span>
        </div>
      }
      title={common.offlineTitle}
      description={common.offlineDescription}
      actions={
        <>
          <RetryButton label={common.retry} />
          <Link
            href={localizePath(locale, routes.home)}
            className={buttonVariants({ variant: "line", size: "lg" })}
          >
            {common.backHome}
          </Link>
        </>
      }
    >
      <QuickLinks locale={locale} nav={nav} title={statusContent[locale].offlineLinks} />
    </StatusScreen>
  );
}
