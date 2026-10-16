"use client";

import { GripVertical, Plus, Trash } from "lucide-react";
import type { ReactNode } from "react";
import { useFieldArray } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { useDragReorder } from "../../lib/use-drag-reorder";
import { useReadOnly } from "./read-only";
import { ReorderButtons } from "./reorder-buttons";
import { useFieldError } from "./use-field-error";

const { common } = adminContent;

interface RepeaterProps {
  name: string;
  addLabel: string;
  emptyLabel: string;
  newItem: () => Record<string, unknown>;
  children: (index: number) => ReactNode;
  itemTitle?: (index: number) => string;
  max?: number;
  compact?: boolean;
}

export function Repeater({
  name,
  addLabel,
  emptyLabel,
  newItem,
  children,
  itemTitle,
  max = 50,
  compact,
}: RepeaterProps) {
  const { fields, append, remove, move } = useFieldArray({ name });
  const { itemProps, handleProps } = useDragReorder(move);
  const error = useFieldError(name);
  const locked = useReadOnly();

  return (
    <div className="flex flex-col gap-3">
      {fields.length === 0 ? (
        <p className="rounded-field border border-dashed border-line-strong px-4 py-5 text-center text-xs text-muted">
          {emptyLabel}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {fields.map((field, index) => {
            const title = itemTitle?.(index) || fill(common.item, { index: faNumber(index + 1) });
            return (
              <li
                key={field.id}
                {...itemProps(index)}
                className="group/item flex flex-col gap-3 rounded-field border border-line bg-raised p-3 transition-[border-color,opacity,box-shadow] data-dragging:opacity-50 data-over:border-primary data-over:shadow-field sm:p-4"
              >
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    aria-label={fill(common.dragHandle, { label: title })}
                    disabled={locked}
                    {...handleProps(index)}
                    className="grid size-8 cursor-grab touch-none place-items-center rounded-lg text-subtle transition-colors hover:bg-chip hover:text-ink active:cursor-grabbing disabled:pointer-events-none disabled:opacity-30 max-sm:hidden"
                  >
                    <GripVertical className="size-4" aria-hidden />
                  </button>
                  <span className="grid size-6 shrink-0 place-items-center rounded-md bg-chip text-caption font-black text-ink">
                    {faNumber(index + 1)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-label font-bold text-ink">
                    {title}
                  </span>
                  <ReorderButtons
                    label={title}
                    isFirst={index === 0}
                    isLast={index === fields.length - 1}
                    onMove={(offset) => move(index, index + offset)}
                  />
                  <ConfirmButton
                    label={`${common.remove} ${title}`}
                    confirmLabel={common.deleteConfirm}
                    onConfirm={() => remove(index)}
                    disabled={locked}
                    className="size-8 rounded-lg"
                    armedClassName="w-auto px-2"
                  >
                    <Trash className="size-4" aria-hidden />
                  </ConfirmButton>
                </div>
                <div className={cn("flex flex-col gap-3", !compact && "sm:gap-4")}>
                  {children(index)}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      {fields.length < max && !locked && (
        <Button variant="line" size="sm" onClick={() => append(newItem())} className="self-start">
          <Plus className="size-4" aria-hidden />
          {addLabel}
        </Button>
      )}
    </div>
  );
}
