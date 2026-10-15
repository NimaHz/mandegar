"use client";

import { Share2 } from "lucide-react";
import { useSyncExternalStore } from "react";

import { CopyButton } from "@/components/shared/copy-button";
import { buttonVariants } from "@/components/ui/button";

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  label: string;
  copyLabel: string;
}

const subscribe = () => () => {};

const canShare = () => typeof navigator.share === "function";

const isAbort = (error: unknown) => error instanceof DOMException && error.name === "AbortError";

export function ShareButton({ url, title, text, label, copyLabel }: ShareButtonProps) {
  const supported = useSyncExternalStore(subscribe, canShare, () => false);

  if (!supported) {
    return <CopyButton value={url} label={copyLabel} className="size-12 rounded-field" />;
  }

  const onShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if (!isAbort(error)) await navigator.clipboard?.writeText(url).catch(() => undefined);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void onShare()}
      aria-label={label}
      className={buttonVariants({ variant: "line", size: "icon-lg" })}
    >
      <Share2 className="size-4.5" aria-hidden />
    </button>
  );
}
