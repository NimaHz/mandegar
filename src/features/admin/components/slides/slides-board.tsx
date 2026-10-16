"use client";

import { CalendarRange, GalleryHorizontalEnd, GripVertical, PenLine, Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/dates";
import type { AdminSlide } from "@/types/admin";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useDragReorder } from "../../lib/use-drag-reorder";
import { useSheetTarget } from "../../lib/use-sheet-target";
import { ListEmpty } from "../data/list-frame";
import { DeleteAction, IconAction } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { ReorderButtons } from "../form/reorder-buttons";
import { PanelHeading } from "../panel-heading";
import { SlidePreview } from "./slide-preview";
import { SlideSheet } from "./slide-sheet";

const copy = adminContent.slides;
const { common } = adminContent;

type Schedule = "live" | "scheduled" | "expired";

const scheduleOf = (slide: AdminSlide, now: number): Schedule => {
  if (slide.startsAt && new Date(slide.startsAt).getTime() > now) return "scheduled";
  if (slide.endsAt && new Date(slide.endsAt).getTime() < now) return "expired";
  return "live";
};

const scheduleTone = { live: "success", scheduled: "primary", expired: "chip" } as const;

const rangeLabel = (slide: AdminSlide) => {
  if (!slide.startsAt && !slide.endsAt) return copy.always;
  return [
    slide.startsAt && fill(copy.from, { date: formatDate("fa", slide.startsAt) }),
    slide.endsAt && fill(copy.until, { date: formatDate("fa", slide.endsAt) }),
  ]
    .filter(Boolean)
    .join(" · ");
};

interface SlidesBoardProps {
  slides: AdminSlide[];
  canWrite: boolean;
  now: number;
}

export function SlidesBoard({ slides, canWrite, now }: SlidesBoardProps) {
  const { run, pending } = useAdminMutation();
  const [order, setOrder] = useState(slides.map((slide) => slide.id));
  const sheet = useSheetTarget<AdminSlide>();
  const editing = sheet.target?.mode === "edit" ? sheet.target.item : null;
  const ordered = order.flatMap((id) => slides.find((slide) => slide.id === id) ?? []);
  const visible = [...ordered, ...slides.filter((slide) => !order.includes(slide.id))];

  const move = (from: number, to: number) => {
    if (pending) return;
    const ids = visible.map((slide) => slide.id);
    const [moved] = ids.splice(from, 1);
    if (!moved) return;
    ids.splice(to, 0, moved);
    const previous = order;
    setOrder(ids);
    void run(() => apiClient.api.admin.slides.order.put({ ids }), {
      success: copy.orderSaved,
      onError: () => setOrder(previous),
    });
  };

  const { itemProps, handleProps } = useDragReorder(move);

  return (
    <div className="flex flex-col gap-5">
      <PanelHeading
        eyebrow={adminContent.shell.groups.content}
        title={copy.title}
        description={copy.description}
        action={
          canWrite && (
            <Button onClick={sheet.openCreate}>
              <Plus className="size-4" aria-hidden />
              {copy.create}
            </Button>
          )
        }
      />
      {visible.length === 0 ? (
        <ListEmpty filtered={false} icon={GalleryHorizontalEnd} title={copy.emptyTitle} />
      ) : (
        <ol className="flex flex-col gap-3">
          {visible.map((slide, index) => {
            const schedule = scheduleOf(slide, now);
            return (
              <li
                key={slide.id}
                {...(canWrite ? itemProps(index) : {})}
                className={cn(
                  "grid grid-cols-1 items-center gap-4 card p-3 shadow-card transition-[border-color,opacity] data-dragging:opacity-50 data-over:border-primary sm:grid-cols-[auto_14rem_minmax(0,1fr)_auto] sm:p-4",
                  !slide.active && "opacity-70",
                )}
              >
                {canWrite && (
                  <div className="flex items-center gap-1 sm:flex-col">
                    <button
                      type="button"
                      aria-label={fill(common.dragHandle, { label: slide.title.fa })}
                      {...handleProps(index)}
                      className="grid size-8 cursor-grab touch-none place-items-center rounded-lg text-subtle hover:bg-chip hover:text-ink active:cursor-grabbing max-sm:hidden"
                    >
                      <GripVertical className="size-4" aria-hidden />
                    </button>
                    <span className="grid size-7 place-items-center rounded-md bg-chip text-caption font-black text-ink">
                      {faNumber(index + 1)}
                    </span>
                    <fieldset disabled={pending} className="flex sm:flex-col">
                      <ReorderButtons
                        label={slide.title.fa}
                        isFirst={index === 0}
                        isLast={index === visible.length - 1}
                        onMove={(offset) => move(index, index + offset)}
                      />
                    </fieldset>
                  </div>
                )}
                <SlidePreview
                  image={slide.image}
                  title={slide.title.fa}
                  subtitle={slide.subtitle.fa}
                  cta={slide.ctaLabel?.fa ?? ""}
                  tone={slide.tone}
                />
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusBadge tone={scheduleTone[schedule]} label={copy[schedule]} />
                    <StatusBadge
                      tone="outline"
                      label={adminContent.statuses.tone[slide.tone]}
                      dot={false}
                    />
                  </div>
                  <h2 className="text-base font-extrabold text-ink">{slide.title.fa}</h2>
                  <p className="line-clamp-2 text-xs leading-6 text-body">{slide.subtitle.fa}</p>
                  <p className="inline-flex items-center gap-1.5 text-caption text-muted">
                    <CalendarRange className="size-3.5" aria-hidden />
                    {rangeLabel(slide)}
                  </p>
                </div>
                <div className="flex items-center gap-1 sm:flex-col sm:items-end">
                  {canWrite && (
                    <div className="min-w-36">
                      <Switch
                        checked={slide.active}
                        onCheckedChange={(active) =>
                          void run(
                            () => apiClient.api.admin.slides({ id: slide.id }).patch({ active }),
                            {
                              success: copy.saved,
                            },
                          )
                        }
                        label={copy.fields.active}
                      />
                    </div>
                  )}
                  <div className="ms-auto flex items-center">
                    <IconAction
                      label={`${common.edit} ${slide.title.fa}`}
                      icon={PenLine}
                      onClick={() => sheet.openEdit(slide)}
                    />
                    {canWrite && (
                      <DeleteAction
                        label={slide.title.fa}
                        onConfirm={() =>
                          void run(() => apiClient.api.admin.slides({ id: slide.id }).delete(), {
                            success: common.deleted,
                          })
                        }
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {sheet.target && (
        <SlideSheet
          key={editing?.id ?? "new"}
          slide={editing}
          nextOrder={Math.max(-10, ...visible.map((slide) => slide.sortOrder)) + 10}
          onClose={sheet.close}
          readOnly={!canWrite}
        />
      )}
    </div>
  );
}
