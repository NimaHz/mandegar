"use client";

import "@/styles/globals.css";

import { House, RotateCcw, TriangleAlert } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/features/info/components/status-screen";
import { statusContent } from "@/features/info/status-content";
import { defaultLocale, isLocale, localeMeta } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { fa } from "@/i18n/dictionaries/fa";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { applyStoredTheme } from "@/lib/theme";
import { fontVariables } from "@/styles/fonts";

const dictionaries = { fa, en } as const;

interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function GlobalError({ error, retry }: GlobalErrorProps) {
  const segment = usePathname().split("/")[1];
  const locale = isLocale(segment) ? segment : defaultLocale;
  const { common, site } = dictionaries[locale];
  const { hreflang, dir } = localeMeta[locale];

  useLayoutEffect(() => applyStoredTheme(), []);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang={hreflang} dir={dir} className={fontVariables} suppressHydrationWarning>
      <head>
        <title>{`${common.errorTitle} | ${site.name}`}</title>
      </head>
      <body className="min-h-dvh overflow-x-clip">
        <main className="flex min-h-dvh flex-col">
          <StatusScreen
            className="flex-1"
            visual={
              <span className="grid size-18 place-items-center rounded-panel bg-danger-soft text-danger shadow-card">
                <TriangleAlert className="size-9" strokeWidth={1.6} aria-hidden />
              </span>
            }
            title={common.errorTitle}
            description={common.errorDescription}
            actions={
              <>
                <Button size="lg" onClick={retry}>
                  <RotateCcw className="size-4.5" aria-hidden />
                  {common.retry}
                </Button>
                <a
                  href={localizePath(locale, routes.home)}
                  className={buttonVariants({ variant: "line", size: "lg" })}
                >
                  <House className="size-4.5" aria-hidden />
                  {common.backHome}
                </a>
              </>
            }
          >
            {error.digest && (
              <p className="text-xs text-muted">
                {statusContent[locale].errorCode}:{" "}
                <bdi dir="ltr" className="font-code text-ink-soft">
                  {error.digest}
                </bdi>
              </p>
            )}
          </StatusScreen>
        </main>
      </body>
    </html>
  );
}
