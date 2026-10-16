"use client";

import { LoaderCircle, RotateCcw, Save } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

import { adminContent } from "../../content";
import { useUnsavedGuard } from "../../lib/use-unsaved-guard";

const { common } = adminContent;

interface SaveBarProps {
  dirty: boolean;
  pending: boolean;
  onDiscard?: () => void;
  submitLabel?: string;
  children?: ReactNode;
  guard?: boolean;
  isNew?: boolean;
}

export function SaveBar({
  dirty,
  pending,
  onDiscard,
  submitLabel = common.saveChanges,
  children,
  guard = true,
  isNew = false,
}: SaveBarProps) {
  useUnsavedGuard(guard && dirty && !pending);

  return (
    <div className="sticky bottom-3 z-30 mt-1">
      <div
        className={cn(
          "flex items-center gap-2 card bg-raised/92 p-2.5 shadow-lift backdrop-blur-xl transition-colors sm:gap-3 sm:ps-4",
          dirty && "border-warning/40",
        )}
      >
        <span role="status" className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold">
          <span
            aria-hidden
            className={cn(
              "size-2 shrink-0 rounded-full",
              dirty ? "bg-warning" : isNew ? "bg-line-strong" : "bg-success",
            )}
          />
          <span className={cn("truncate", dirty ? "text-ink" : "text-muted")}>
            {dirty ? common.unsaved : isNew ? common.notCreated : common.upToDate}
          </span>
        </span>
        {children}
        {dirty && onDiscard && (
          <Button
            variant="soft"
            size="sm"
            onClick={onDiscard}
            disabled={pending}
            className="max-sm:px-2.5"
          >
            <RotateCcw className="size-4" aria-hidden />
            <span className="max-sm:sr-only">{common.discard}</span>
          </Button>
        )}
        <Button type="submit" disabled={pending} size="sm" className="h-10 px-4">
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          {pending ? common.saving : submitLabel}
        </Button>
      </div>
    </div>
  );
}
