"use client";

import { useQueryStates } from "nuqs";
import { Suspense, useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { Locale } from "@/i18n/config";
import { useDictionary } from "@/i18n/locale-provider";
import { parseWarrantyCode } from "@/lib/warranty-code";

import type { WarrantyContent } from "../content";
import { lookupKey, useWarrantyLookupStore } from "../lookup-store";
import { warrantySearchParams } from "../search-params";
import { WarrantyResult } from "./warranty-result";

interface WarrantyLookupProps {
  locale: Locale;
  content: WarrantyContent;
}

function LookupSkeleton() {
  const { common } = useDictionary();
  return (
    <div
      role="status"
      aria-label={common.loading}
      className="flex flex-col gap-5 panel bg-raised p-5 shadow-card sm:p-7"
    >
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 shrink-0 rounded-field" />
        <div className="flex w-full flex-col gap-2.5">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-card" />
    </div>
  );
}

function QueryLookup({ locale, content }: WarrantyLookupProps) {
  const [{ code }] = useQueryStates(warrantySearchParams);
  const parsed = parseWarrantyCode(code);
  const valid = parsed.valid ? parsed.code : null;
  const check = useWarrantyLookupStore((state) => state.check);
  const key = useWarrantyLookupStore((state) => state.key);
  const loading = useWarrantyLookupStore((state) => state.loading);
  const lookup = useWarrantyLookupStore((state) => state.lookup);
  const current = valid !== null && key === lookupKey(locale, valid);

  useEffect(() => {
    if (valid) void check(locale, valid);
  }, [check, locale, valid]);

  if (!valid || (current && !loading && !lookup)) return null;

  return (
    <div className="container-page pb-6 sm:pb-10">
      <div className="mx-auto max-w-5xl">
        {current && lookup ? (
          <WarrantyResult lookup={lookup} locale={locale} content={content} />
        ) : (
          <LookupSkeleton />
        )}
      </div>
    </div>
  );
}

export function WarrantyLookup(props: WarrantyLookupProps) {
  return (
    <Suspense fallback={null}>
      <QueryLookup {...props} />
    </Suspense>
  );
}
