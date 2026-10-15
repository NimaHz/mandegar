"use client";

import { PartyPopper, RotateCcw } from "lucide-react";

import { ProgressBar } from "@/components/ui/progress-bar";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { formatNumber } from "@/lib/format";

import type { GuidesContent } from "../content";
import { useGuideProgress } from "../use-guide-progress";

interface GuideProgressProps {
  slug: string;
  total: number;
  copy: GuidesContent["detail"]["steps"];
}

export function GuideProgress({ slug, total, copy }: GuideProgressProps) {
  const locale = useLocale();
  const { done, reset } = useGuideProgress(slug, total);
  const count = done.length;
  const label = fill(copy.progress, {
    done: formatNumber(locale, count),
    total: formatNumber(locale, total),
  });
  const complete = total > 0 && count === total;

  return (
    <div className="flex flex-col gap-3 card bg-raised p-5">
      <div className="flex items-center justify-between gap-3">
        <p role="status" className="text-sm font-extrabold text-ink">
          {label}
        </p>
        {count > 0 && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-caption font-bold text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            <RotateCcw className="size-3.5" aria-hidden />
            {copy.reset}
          </button>
        )}
      </div>
      <ProgressBar
        value={total ? (count / total) * 100 : 0}
        label={label}
        barClassName={complete ? "bg-success" : undefined}
      />
      {complete && (
        <div className="flex items-start gap-2.5 rounded-field bg-success-soft p-3 text-success">
          <PartyPopper className="mt-0.5 size-4.5 shrink-0" aria-hidden />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-extrabold">{copy.completeTitle}</p>
            <p className="text-xs leading-6 text-body">{copy.completeBody}</p>
          </div>
        </div>
      )}
    </div>
  );
}
