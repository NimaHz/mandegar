"use client";

import { Share2 } from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { useCanShare } from "@/hooks/use-can-share";
import { isAbortError } from "@/lib/errors";

interface ShareButtonProps {
  url: string;
  title: string;
  text: string;
  label: string;
  copyLabel: string;
}

export function ShareButton({ url, title, text, label, copyLabel }: ShareButtonProps) {
  const supported = useCanShare();

  if (!supported) {
    return <CopyButton value={url} label={copyLabel} className="size-12 rounded-field" />;
  }

  const onShare = async () => {
    try {
      await navigator.share({ title, text, url });
    } catch (error) {
      if (!isAbortError(error)) await navigator.clipboard?.writeText(url).catch(() => undefined);
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
