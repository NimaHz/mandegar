"use client";

import { GripVertical, ImagePlus, Library, LoaderCircle, Star, Trash } from "lucide-react";
import { useRef, useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { toast } from "@/components/ui/toast";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import type { AdminMediaRef } from "@/types/admin";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { acceptFor, acceptsFile } from "../../lib/upload";
import { useDragReorder } from "../../lib/use-drag-reorder";
import { LocalizedField } from "../form/localized-field";
import { useReadOnly } from "../form/read-only";
import { ReorderButtons } from "../form/reorder-buttons";
import { useFieldError } from "../form/use-field-error";
import { MediaPicker } from "../media/media-picker";
import { MediaThumb } from "../media/media-thumb";
import { useMediaUpload } from "../media/use-media-upload";

const copy = adminContent.gallery;
const { common } = adminContent;
const MAX_IMAGES = 30;

interface GalleryManagerProps {
  name: string;
  initialMedia: Record<string, AdminMediaRef>;
}

interface ImageValue {
  mediaId: string;
  isPrimary?: boolean;
}

const asImages = (value: unknown): ImageValue[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is ImageValue =>
          typeof item === "object" && item !== null && "mediaId" in item,
      )
    : [];

export function GalleryManager({ name, initialMedia }: GalleryManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { setValue, getValues } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ name });
  const images = asImages(useWatch({ name }));
  const [media, setMedia] = useState(initialMedia);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [queue, setQueue] = useState(0);
  const { upload, progress } = useMediaUpload();
  const { itemProps, handleProps } = useDragReorder(move);
  const listError = useFieldError(name);
  const rootError = useFieldError(`${name}.root`);
  const error = listError ?? rootError;
  const locked = useReadOnly();

  const currentCount = () => asImages(getValues(name)).length;

  const add = (ref: AdminMediaRef) => {
    const current = asImages(getValues(name));
    if (current.some((image) => image.mediaId === ref.id)) {
      toast({ title: copy.duplicate, tone: "info" });
      return;
    }
    setMedia((known) => ({ ...known, [ref.id]: ref }));
    append({
      mediaId: ref.id,
      alt: { fa: ref.alt.fa, en: ref.alt.en },
      isPrimary: !current.some((image) => image.isPrimary),
    });
  };

  const rejectKind = () =>
    toast({ title: adminContent.mediaField.wrongKind.image, tone: "danger" });

  const onFiles = async (files: FileList | null) => {
    const chosen = Array.from(files ?? []);
    const accepted = chosen.filter((file) => acceptsFile("image", file));
    if (accepted.length < chosen.length) rejectKind();
    const list = accepted.slice(0, MAX_IMAGES - currentCount());
    setQueue((count) => count + list.length);
    for (const file of list) {
      const uploaded = await upload(file);
      if (uploaded && uploaded.kind !== "image") rejectKind();
      else if (uploaded && currentCount() < MAX_IMAGES) add(uploaded);
      setQueue((count) => count - 1);
    }
  };

  const makePrimary = (target: number) =>
    images.forEach((_, index) =>
      setValue(`${name}.${index}.isPrimary`, index === target, { shouldDirty: true }),
    );

  const removeAt = (index: number) => {
    const wasPrimary = images[index]?.isPrimary;
    remove(index);
    if (wasPrimary && images.length > 1)
      setValue(`${name}.0.isPrimary`, true, { shouldDirty: true });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={queue > 0 || locked}
          className="flex flex-col items-center gap-2 rounded-field border border-dashed border-line-strong bg-sunken/50 px-6 py-10 text-center transition-colors hover:border-primary hover:bg-primary-soft/40 disabled:pointer-events-none disabled:opacity-60"
        >
          <ImagePlus className="size-8 text-subtle" strokeWidth={1.5} aria-hidden />
          <span className="text-sm font-bold text-ink">{copy.emptyTitle}</span>
          <span className="text-xs text-muted">{copy.emptyHint}</span>
        </button>
      ) : (
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-3">
          {fields.map((field, index) => {
            const value = images[index];
            const ref = value ? (media[value.mediaId] ?? initialMedia[value.mediaId]) : undefined;
            const title = fill(copy.image, { index: faNumber(index + 1) });
            return (
              <li
                key={field.id}
                {...itemProps(index)}
                className={cn(
                  "flex flex-col overflow-hidden rounded-field border bg-raised transition-[border-color,opacity,box-shadow] data-dragging:opacity-50 data-over:border-primary data-over:shadow-field",
                  value?.isPrimary ? "border-accent/70" : "border-line",
                )}
              >
                <div className="relative aspect-[4/3] bg-sunken">
                  {ref && (
                    <MediaThumb
                      media={ref}
                      sizes="(min-width: 1536px) 18rem, (min-width: 640px) 40vw, 90vw"
                    />
                  )}
                  {value?.isPrimary && (
                    <span className="absolute start-2 top-2 inline-flex h-6 items-center gap-1 rounded-full bg-accent px-2 text-caption font-extrabold text-on-accent">
                      <Star className="size-3 fill-current" aria-hidden />
                      {copy.primary}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={fill(common.dragHandle, { label: title })}
                    disabled={locked}
                    {...handleProps(index)}
                    className="absolute end-2 top-2 grid size-8 cursor-grab touch-none place-items-center rounded-lg bg-surface/90 text-ink shadow-card backdrop-blur active:cursor-grabbing disabled:hidden max-sm:hidden"
                  >
                    <GripVertical className="size-4" aria-hidden />
                  </button>
                </div>
                <div className="flex items-center gap-0.5 border-b border-line px-1.5 py-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => makePrimary(index)}
                    disabled={value?.isPrimary || locked}
                    className="h-8 px-2"
                  >
                    <Star className="size-4" aria-hidden />
                    {copy.setPrimary}
                  </Button>
                  <span className="ms-auto flex items-center">
                    <ReorderButtons
                      label={title}
                      isFirst={index === 0}
                      isLast={index === fields.length - 1}
                      onMove={(offset) => move(index, index + offset)}
                    />
                    <ConfirmButton
                      label={`${common.remove} ${title}`}
                      confirmLabel={common.deleteConfirm}
                      onConfirm={() => removeAt(index)}
                      disabled={locked}
                      className="size-8 rounded-lg"
                      armedClassName="w-auto px-2"
                    >
                      <Trash className="size-4" aria-hidden />
                    </ConfirmButton>
                  </span>
                </div>
                <div className="p-3">
                  <LocalizedField name={`${name}.${index}.alt`} label={copy.alt} maxLength={200} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
      {error && <p className="text-xs font-semibold text-danger">{error}</p>}
      {queue > 0 && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-field bg-primary-soft/60 px-3.5 py-2.5"
        >
          <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
          <span className="text-xs font-bold text-ink">
            {fill(copy.uploading, { count: faNumber(queue) })}
          </span>
          <ProgressBar
            value={(progress ?? 0) * 100}
            label={copy.uploadProgress}
            className="h-1.5 flex-1"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="line"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={queue > 0 || fields.length >= MAX_IMAGES || locked}
        >
          <ImagePlus className="size-4" aria-hidden />
          {copy.upload}
        </Button>
        <Button
          variant="soft"
          size="sm"
          onClick={() => setPickerOpen(true)}
          disabled={fields.length >= MAX_IMAGES || locked}
        >
          <Library className="size-4" aria-hidden />
          {copy.library}
        </Button>
        <span className="ms-auto self-center text-caption text-muted">
          {fill(copy.count, { count: faNumber(fields.length), max: faNumber(MAX_IMAGES) })}
        </span>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptFor(["image"])}
        className="sr-only"
        tabIndex={-1}
        aria-label={copy.upload}
        onChange={(event) => {
          void onFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        kind="image"
        onPick={add}
        pickedIds={images.map((image) => image.mediaId)}
      />
    </div>
  );
}
