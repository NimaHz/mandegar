"use client";

import { MonitorDown } from "lucide-react";

import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";

import { useInstallPrompt } from "./use-install-prompt";

interface InstallAppButtonProps {
  className?: string;
}

export function InstallAppButton({ className }: InstallAppButtonProps) {
  const { ui } = useDictionary();
  const { canInstall, install } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={() => void install()}
      className={cn(
        "flex items-center gap-3 rounded-field border border-line bg-raised px-4 py-3 text-start transition-colors hover:border-primary/50",
        className,
      )}
    >
      <span className="grid size-9 place-items-center rounded-control bg-primary text-on-primary">
        <MonitorDown className="size-4.5" aria-hidden />
      </span>
      <span className="flex flex-col">
        <span className="text-sm font-bold text-ink">{ui.installApp}</span>
        <span className="text-xs text-muted">{ui.installAppHint}</span>
      </span>
    </button>
  );
}
