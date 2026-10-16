"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

const OFFLINE_FROM = "from";

const retryTarget = () => {
  const from = new URLSearchParams(window.location.hash.slice(1)).get(OFFLINE_FROM);
  if (!from?.startsWith("/") || from.startsWith("//") || from.includes("\\")) return null;
  const url = new URL(from, window.location.origin);
  return url.origin === window.location.origin ? `${url.pathname}${url.search}` : null;
};

const retry = () => {
  const target = retryTarget();
  if (target) window.location.replace(target);
  else window.location.reload();
};

export function RetryButton({ label }: { label: string }) {
  return (
    <Button size="lg" onClick={retry}>
      <RotateCcw className="size-4.5" aria-hidden />
      {label}
    </Button>
  );
}
