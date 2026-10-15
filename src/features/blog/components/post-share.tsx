"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useSyncExternalStore } from "react";

import { IconSwap } from "@/components/motion/icon-swap";
import { useCopy } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const subscribe = () => () => undefined;

const canShare = () => typeof navigator.share === "function";

interface PostShareProps {
  title: string;
  labels: { copy: string; copied: string; failed: string; share: string };
  className?: string;
}

export function PostShare({ title, labels, className }: PostShareProps) {
  const nativeShare = useSyncExternalStore(subscribe, canShare, () => false);
  const { status, copy } = useCopy();
  const copied = status === "copied";

  const share = () => {
    void navigator.share({ title, url: window.location.href }).catch(() => undefined);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        variant="line"
        size="sm"
        onClick={() => void copy(window.location.href)}
        className={cn("min-w-32", copied && "border-success/40 text-success hover:border-success")}
      >
        <IconSwap swapKey={copied ? "check" : "link"}>
          {copied ? <Check className="size-4" strokeWidth={2.6} /> : <Link2 className="size-4" />}
        </IconSwap>
        {copied ? labels.copied : labels.copy}
      </Button>
      {nativeShare && (
        <Button variant="line" size="sm" onClick={share} className="px-3">
          <Share2 className="size-4" aria-hidden />
          {labels.share}
        </Button>
      )}
      <span className="sr-only" role="status">
        {copied ? labels.copied : status === "failed" ? labels.failed : ""}
      </span>
    </div>
  );
}
