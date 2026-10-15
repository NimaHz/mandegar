"use client";

import { RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export function RetryButton({ label }: { label: string }) {
  return (
    <Button size="lg" onClick={() => window.location.reload()}>
      <RotateCcw className="size-4.5" aria-hidden />
      {label}
    </Button>
  );
}
