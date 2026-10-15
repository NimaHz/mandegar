"use client";

import { KeyRound } from "lucide-react";

import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";

import { adminContent } from "../../content";

const copy = adminContent.users;

interface TempPasswordSheetProps {
  value: { name: string; password: string } | null;
  onClose: () => void;
}

export function TempPasswordSheet({ value, onClose }: TempPasswordSheetProps) {
  return (
    <Sheet open={value !== null} onClose={onClose} title={copy.tempTitle}>
      {value && (
        <div className="flex flex-col items-center gap-4 text-center">
          <span className="icon-tile size-12 rounded-field bg-warning-soft text-warning">
            <KeyRound className="size-5.5" aria-hidden />
          </span>
          <p className="text-sm font-bold text-ink">
            <bdi>{value.name}</bdi>
          </p>
          <div className="flex w-full items-center gap-2 rounded-field border border-line-strong bg-raised p-2 ps-4">
            <bdi
              dir="ltr"
              className="min-w-0 flex-1 truncate text-start font-code text-lg font-bold tracking-wider text-ink"
            >
              {value.password}
            </bdi>
            <CopyButton value={value.password} label={copy.tempCopy} className="size-10" />
          </div>
          <p className="max-w-sm text-xs leading-6 text-muted">{copy.tempHint}</p>
          <Button block onClick={onClose}>
            {copy.done}
          </Button>
        </div>
      )}
    </Sheet>
  );
}
