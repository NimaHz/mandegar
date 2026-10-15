import { ArrowDown, ArrowUp } from "lucide-react";

import { fill } from "@/i18n/fill";

import { adminContent } from "../../content";

interface ReorderButtonsProps {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (offset: -1 | 1) => void;
}

const buttonClass =
  "grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-chip hover:text-ink disabled:pointer-events-none disabled:opacity-30";

export function ReorderButtons({ label, isFirst, isLast, onMove }: ReorderButtonsProps) {
  return (
    <>
      <button
        type="button"
        onClick={() => onMove(-1)}
        disabled={isFirst}
        aria-label={fill(adminContent.common.moveUp, { label })}
        className={buttonClass}
      >
        <ArrowUp className="size-4" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => onMove(1)}
        disabled={isLast}
        aria-label={fill(adminContent.common.moveDown, { label })}
        className={buttonClass}
      >
        <ArrowDown className="size-4" aria-hidden />
      </button>
    </>
  );
}
