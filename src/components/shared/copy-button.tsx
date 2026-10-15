"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { IconSwap } from "@/components/motion/icon-swap";
import { fill } from "@/i18n/fill";
import { useDictionary } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";

export type CopyStatus = "idle" | "copied" | "failed";

const FEEDBACK_MS = 2000;

export function useCopy() {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async (text: string) => {
    const copied = await navigator.clipboard.writeText(text).then(
      () => true,
      () => false,
    );
    setStatus(copied ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), FEEDBACK_MS);
    return copied;
  };

  const reset = () => {
    window.clearTimeout(timer.current);
    setStatus("idle");
  };

  return { status, copy, reset };
}

interface CopyButtonProps {
  value: string;
  label: string;
  className?: string;
}

export function CopyButton({ value, label, className }: CopyButtonProps) {
  const { ui } = useDictionary();
  const { status, copy } = useCopy();
  const copied = status === "copied";
  const announcement = {
    idle: "",
    copied: fill(ui.copySuccess, { label }),
    failed: ui.copyFailed,
  }[status];

  return (
    <button
      type="button"
      onClick={() => void copy(value)}
      aria-label={fill(ui.copyLabel, { label })}
      className={cn(
        "grid shrink-0 place-items-center rounded-control transition-colors duration-200",
        copied
          ? "bg-success-soft text-success"
          : status === "failed"
            ? "bg-danger-soft text-danger"
            : "bg-chip/70 text-ink hover:bg-primary-soft hover:text-primary",
        className,
      )}
    >
      <IconSwap swapKey={copied ? "check" : "copy"}>
        {copied ? (
          <Check className="size-4" strokeWidth={2.8} />
        ) : (
          <Copy className="size-4" strokeWidth={1.9} />
        )}
      </IconSwap>
      <span role="status" className="sr-only">
        {announcement}
      </span>
    </button>
  );
}
