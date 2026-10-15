"use client";

import { CircleAlert, LoaderCircle, ShieldCheck } from "lucide-react";

import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";

import type { AltchaState } from "./use-altcha";

interface AltchaWidgetProps {
  state: AltchaState;
  className?: string;
}

export function AltchaWidget({ state, className }: AltchaWidgetProps) {
  const { ui } = useDictionary();
  const { status } = state;
  const label = {
    idle: ui.altchaIdle,
    verifying: ui.altchaVerifying,
    verified: ui.altchaVerified,
    error: ui.altchaFailed,
  }[status];

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-field border px-3.5 py-3 transition-colors",
        status === "verified" && "border-success/30 bg-success-soft/50",
        status === "error" && "border-danger/30 bg-danger-soft/50",
        (status === "verifying" || status === "idle") && "border-line bg-surface",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full",
          status === "verified" && "bg-success text-white dark:text-night",
          status === "error" && "bg-danger text-white dark:text-night",
          (status === "verifying" || status === "idle") && "bg-primary-soft text-primary",
        )}
      >
        {status === "error" ? (
          <CircleAlert className="size-4.5" />
        ) : status === "verifying" ? (
          <LoaderCircle className="size-4.5 animate-spin" />
        ) : (
          <ShieldCheck className="size-4.5" />
        )}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5" role="status" aria-live="polite">
        <span className="text-sm font-bold text-ink">{label}</span>
        <span className="text-xs text-muted">{ui.altchaHint}</span>
      </span>
      {status === "error" && (
        <button
          type="button"
          onClick={state.renew}
          className="shrink-0 rounded-control px-3 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          {ui.altchaRetry}
        </button>
      )}
    </div>
  );
}
