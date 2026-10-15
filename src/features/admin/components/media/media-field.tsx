"use client";

import { ImagePlus, Library, LoaderCircle, Trash, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { cn } from "@/lib/cn";
import type { AdminMediaRef, MediaKind } from "@/types/admin";

import { adminContent } from "../../content";
import { acceptFor } from "../../lib/upload";
import { useFieldError } from "../form/use-field-error";
import { MediaPicker } from "./media-picker";
import { MediaThumb } from "./media-thumb";
import { useMediaUpload } from "./use-media-upload";

const copy = adminContent.mediaField;

interface MediaFieldProps {
  name: string;
  label: string;
  initial?: AdminMediaRef | null;
  kind?: MediaKind;
  hint?: string;
  aspect?: string;
  fit?: "cover" | "contain";
  onMedia?: (media: AdminMediaRef | null) => void;
}

export function MediaField({
  name,
  label,
  initial = null,
  kind = "image",
  hint,
  aspect = "aspect-[4/3]",
  fit = "cover",
  onMedia,
}: MediaFieldProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const { setValue } = useFormContext();
  const value: unknown = useWatch({ name });
  const error = useFieldError(name);
  const [preview, setPreview] = useState<AdminMediaRef | null>(initial);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { upload, progress, uploading } = useMediaUpload();
  const current = typeof value === "string" && preview?.id === value ? preview : null;
  const [dragging, setDragging] = useState(false);

  const choose = (media: AdminMediaRef | null) => {
    setPreview(media);
    setValue(name, media?.id ?? null, { shouldDirty: true, shouldValidate: Boolean(error) });
    onMedia?.(media);
  };

  const onFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    const media = await upload(file);
    if (media) choose(media);
  };

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <span id={`${id}-label`} className="text-label font-bold text-ink">
        {label}
      </span>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void onFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex min-w-0 flex-col overflow-hidden rounded-field border bg-sunken/60 transition-colors",
          dragging
            ? "border-primary bg-primary-soft/60"
            : error
              ? "border-danger"
              : "border-dashed border-line-strong",
        )}
      >
        <div className={cn("relative w-full", aspect)}>
          {current ? (
            <MediaThumb media={current} sizes="(min-width: 1024px) 22rem, 90vw" fit={fit} />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center text-xs text-muted">
              <ImagePlus className="size-7 text-subtle" strokeWidth={1.5} aria-hidden />
              {copy.dropHint}
            </span>
          )}
          {uploading && (
            <span className="absolute inset-0 grid place-items-center bg-surface/80 p-6 backdrop-blur-sm">
              <span className="flex w-full max-w-48 flex-col items-center gap-2" role="status">
                <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />
                <ProgressBar
                  value={(progress ?? 0) * 100}
                  label={copy.uploading}
                  className="h-1.5 w-full"
                />
              </span>
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1 border-t border-line bg-surface p-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="size-4" aria-hidden />
            {current ? copy.replace : copy.upload}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setPickerOpen(true)}
            disabled={uploading}
          >
            <Library className="size-4" aria-hidden />
            {copy.library}
          </Button>
          {current && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => choose(null)}
              className="ms-auto"
              aria-label={copy.remove}
            >
              <Trash className="size-4" aria-hidden />
            </Button>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={acceptFor([kind])}
          className="sr-only"
          tabIndex={-1}
          aria-labelledby={`${id}-label`}
          onChange={(event) => {
            void onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
      {(error || hint) && (
        <p className={cn("text-xs", error ? "font-semibold text-danger" : "text-muted")}>
          {error ?? hint}
        </p>
      )}
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        kind={kind}
        onPick={choose}
        selectedId={current?.id ?? null}
      />
    </div>
  );
}
