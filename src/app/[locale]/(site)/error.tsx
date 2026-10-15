"use client";

import { House, RotateCcw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { StatusScreen } from "@/features/info/components/status-screen";
import { statusContent } from "@/features/info/status-content";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";

interface SiteErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function SiteError({ error, retry }: SiteErrorProps) {
  const locale = useLocale();
  const { common } = useDictionary();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
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
          <Link
            href={localizePath(locale, routes.home)}
            className={buttonVariants({ variant: "line", size: "lg" })}
          >
            <House className="size-4.5" aria-hidden />
            {common.backHome}
          </Link>
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
  );
}
