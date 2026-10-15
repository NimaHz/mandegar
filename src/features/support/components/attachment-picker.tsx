"use client";

import { FileText, ImagePlus, Paperclip, X } from "lucide-react";
import { type ChangeEvent, type DragEvent, useId, useState } from "react";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatBytes, formatNumber, MB } from "@/lib/format";
import {
  attachmentKey,
  screenAttachments,
  TICKET_ATTACHMENT_ACCEPT,
  TICKET_ATTACHMENT_LIMIT,
  TICKET_ATTACHMENT_MAX_BYTES,
} from "@/lib/tickets";

export interface AttachmentLabels {
  label: string;
  optional: string;
  drop: string;
  browse: string;
  rules: string;
  hint: string;
  remove: string;
  tooMany: string;
  tooBig: string;
  badType: string;
  count: string;
}

interface AttachmentPickerProps {
  files: File[];
  onChange: (files: File[]) => void;
  labels: AttachmentLabels;
  error?: string | undefined;
}

function Preview({ file }: { file: File }) {
  if (!file.type.startsWith("image/")) {
    return (
      <span className="grid size-full place-items-center bg-danger-soft text-danger">
        <FileText className="size-6" aria-hidden />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      ref={(node) => {
        if (!node) return;
        const url = URL.createObjectURL(file);
        node.style.backgroundImage = `url("${url}")`;
        return () => URL.revokeObjectURL(url);
      }}
      className="block size-full bg-sunken bg-cover bg-center"
    />
  );
}

export function AttachmentPicker({ files, onChange, labels, error }: AttachmentPickerProps) {
  const locale = useLocale();
  const inputId = useId();
  const messageId = `${inputId}-message`;
  const [dragging, setDragging] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);
  const size = formatNumber(locale, TICKET_ATTACHMENT_MAX_BYTES / MB);
  const limit = formatNumber(locale, TICKET_ATTACHMENT_LIMIT);
  const full = files.length >= TICKET_ATTACHMENT_LIMIT;

  const add = (incoming: File[]) => {
    const { accepted, problems: found } = screenAttachments(files, incoming);
    setProblems(
      found.map((problem) =>
        problem.kind === "type"
          ? fill(labels.badType, { name: problem.name })
          : problem.kind === "size"
            ? fill(labels.tooBig, { name: problem.name, size })
            : fill(labels.tooMany, { count: limit }),
      ),
    );
    if (accepted.length > 0) onChange([...files, ...accepted]);
  };

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    add([...(event.target.files ?? [])]);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (!full) add([...event.dataTransfer.files]);
  };

  const messages = [...problems, ...(error ? [error] : [])];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-label font-bold text-ink">
          {labels.label}
          <span className="ms-1.5 text-caption font-semibold text-muted">({labels.optional})</span>
        </span>
        <span className="text-caption font-semibold text-muted tabular-nums">
          {fill(labels.count, {
            count: formatNumber(locale, files.length),
            max: limit,
          })}
        </span>
      </div>

      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault();
          if (!full) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex flex-col items-center gap-2 rounded-field border-2 border-dashed px-4 py-6 text-center transition-colors",
          full
            ? "cursor-not-allowed border-line bg-surface opacity-60"
            : "cursor-pointer border-line-strong bg-surface focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/15 hover:border-primary hover:bg-primary-soft/40",
          dragging && "border-primary bg-primary-soft/60",
        )}
      >
        <span className="icon-tile size-11 rounded-full">
          <ImagePlus className="size-5" aria-hidden />
        </span>
        <span className="text-sm font-semibold text-ink">
          {labels.drop}{" "}
          <span className="text-primary underline underline-offset-4">{labels.browse}</span>
        </span>
        <span className="text-caption text-muted">
          {fill(labels.rules, { count: limit, size })}
        </span>
        <input
          id={inputId}
          type="file"
          multiple
          accept={TICKET_ATTACHMENT_ACCEPT}
          disabled={full}
          onChange={onInput}
          aria-describedby={messageId}
          className="sr-only"
        />
      </label>

      {files.length > 0 && (
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {files.map((file) => (
            <li
              key={attachmentKey(file)}
              className="flex items-center gap-3 rounded-field border border-line bg-raised p-2 pe-1.5"
            >
              <span className="size-12 shrink-0 overflow-hidden rounded-control">
                <Preview file={file} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-semibold text-ink" dir="auto">
                  {file.name}
                </span>
                <span className="text-caption text-muted">{formatBytes(locale, file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setProblems([]);
                  onChange(files.filter((entry) => entry !== file));
                }}
                aria-label={fill(labels.remove, { name: file.name })}
                className="icon-btn size-9 hover:bg-danger-soft hover:text-danger"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div id={messageId} className="flex flex-col gap-1">
        {messages.length > 0 ? (
          <ul role="alert" className="flex flex-col gap-1">
            {messages.map((message) => (
              <li key={message} className="text-xs font-semibold text-danger">
                {message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="inline-flex items-center gap-1.5 text-xs text-muted">
            <Paperclip className="size-3.5" aria-hidden />
            {labels.hint}
          </p>
        )}
      </div>
    </div>
  );
}
