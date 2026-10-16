"use client";

import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { useCompareStore } from "@/stores/compare";
import { useStoresHydrated } from "@/stores/hydration";

import { compareContent } from "../content";
import { compareHref } from "../href";

interface CompareStoreSyncProps {
  requested: boolean;
  slugs: string[];
}

export function CompareStoreSync({ requested, slugs }: CompareStoreSyncProps) {
  const locale = useLocale();
  const router = useRouter();
  const hydrated = useStoresHydrated();
  const stored = useCompareStore((state) => state.slugs);
  const key = slugs.join(",");
  const restoring = hydrated && !requested && stored.length > 0;

  useEffect(() => {
    if (!hydrated || !requested || !key) return;
    const current = useCompareStore.getState().slugs;
    if (current.join(",") !== key) useCompareStore.setState({ slugs: key.split(",") });
  }, [hydrated, requested, key]);

  useEffect(() => {
    if (!hydrated || requested) return;
    const current = useCompareStore.getState().slugs;
    if (current.length > 0) router.replace(compareHref(locale, current), { scroll: false });
  }, [hydrated, requested, router, locale]);

  if (!restoring) return null;

  return (
    <p
      role="status"
      className="inline-flex items-center gap-2 self-center text-sm font-semibold text-muted"
    >
      <LoaderCircle className="size-4 animate-spin text-primary" aria-hidden />
      {compareContent[locale].page.restoring}
    </p>
  );
}
