"use client";

import { FileText, Paperclip, X } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { fill } from "@/i18n/fill";
import {
  TICKET_ATTACHMENT_LIMIT,
  TICKET_ATTACHMENT_MAX_BYTES,
  ticketAttachmentTypes,
} from "@/server/modules/tickets/schema";

import { adminContent } from "../../content";
import { faNumber, formatBytes } from "../../lib/format";

const copy = adminContent.tickets.composer;
const ACCEPT = ticketAttachmentTypes.join(",");
const FORMATS = "JPG · PNG · WEBP · PDF";
const EXTENSIONS = /\.(jpe?g|png|webp|pdf)$/i;
const MAX_MB = faNumber(TICKET_ATTACHMENT_MAX_BYTES / (1024 * 1024));

const isAccepted = (file: File) =>
  ticketAttachmentTypes.some((type) => type === file.type) ||
  (file.type === "" && EXTENSIONS.test(file.name));

const fileKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export interface ReplyAttachmentsState {
  files: File[];
  problems: string[];
  add: (incoming: File[]) => void;
  remove: (file: File) => void;
  clear: () => void;
}

export function useReplyAttachments(): ReplyAttachmentsState {
  const [files, setFiles] = useState<File[]>([]);
  const [problems, setProblems] = useState<string[]>([]);

  const add = (incoming: File[]) => {
    const issues: string[] = [];
    const known = new Set(files.map(fileKey));
    const accepted: File[] = [];
    for (const file of incoming) {
      if (known.has(fileKey(file))) continue;
      if (!isAccepted(file)) {
        issues.push(fill(copy.badType, { name: file.name }));
        continue;
      }
      if (file.size > TICKET_ATTACHMENT_MAX_BYTES) {
        issues.push(fill(copy.tooBig, { name: file.name, size: MAX_MB }));
        continue;
      }
      if (files.length + accepted.length >= TICKET_ATTACHMENT_LIMIT) {
        issues.push(fill(copy.tooMany, { count: faNumber(TICKET_ATTACHMENT_LIMIT) }));
        break;
      }
      known.add(fileKey(file));
      accepted.push(file);
    }
    setProblems(issues);
    if (accepted.length > 0) setFiles([...files, ...accepted]);
  };

  return {
    files,
    problems,
    add,
    remove: (file) => {
      setProblems([]);
      setFiles(files.filter((entry) => entry !== file));
    },
    clear: () => {
      setFiles([]);
      setProblems([]);
    },
  };
}

function FilePreview({ file }: { file: File }) {
  if (!file.type.startsWith("image/"))
    return (
      <span className="grid size-full place-items-center bg-danger-soft text-danger">
        <FileText className="size-5" aria-hidden />
      </span>
    );
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

interface ReplyAttachmentsProps {
  attachments: ReplyAttachmentsState;
  disabled?: boolean;
}

export function ReplyAttachments({ attachments, disabled }: ReplyAttachmentsProps) {
  const inputId = useId();
  const hintId = `${inputId}-hint`;
  const inputRef = useRef<HTMLInputElement>(null);
  const { files, problems, add, remove } = attachments;
  const full = files.length >= TICKET_ATTACHMENT_LIMIT;

  const onInput = (event: ChangeEvent<HTMLInputElement>) => {
    add([...(event.target.files ?? [])]);
    event.target.value = "";
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <Button
          variant="line"
          size="sm"
          disabled={disabled || full}
          aria-describedby={hintId}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip className="size-4" aria-hidden />
          {copy.attach}
        </Button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple
          accept={ACCEPT}
          tabIndex={-1}
          onChange={onInput}
          className="sr-only"
          aria-label={copy.attach}
        />
        <span id={hintId} className="text-caption text-muted">
          <bdi dir="ltr" className="font-code">
            {FORMATS}
          </bdi>
          {" · "}
          {fill(copy.attachHint, { count: faNumber(TICKET_ATTACHMENT_LIMIT), size: MAX_MB })}
        </span>
        {files.length > 0 && (
          <span role="status" className="ms-auto text-caption font-bold text-ink-soft tabular-nums">
            {fill(copy.attachCount, {
              count: faNumber(files.length),
              max: faNumber(TICKET_ATTACHMENT_LIMIT),
            })}
          </span>
        )}
      </div>
      {files.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {files.map((file) => (
            <li
              key={fileKey(file)}
              className="flex max-w-64 min-w-0 items-center gap-2.5 rounded-field border border-line bg-raised p-1.5 pe-1"
            >
              <span className="size-10 shrink-0 overflow-hidden rounded-control">
                <FilePreview file={file} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span dir="auto" className="truncate text-label font-bold text-ink">
                  {file.name}
                </span>
                <span className="text-caption text-muted">{formatBytes(file.size)}</span>
              </span>
              <button
                type="button"
                onClick={() => remove(file)}
                disabled={disabled}
                aria-label={fill(copy.removeFile, { name: file.name })}
                className="icon-btn size-8 hover:bg-danger-soft hover:text-danger"
              >
                <X className="size-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      {problems.length > 0 && (
        <ul role="alert" className="flex flex-col gap-1">
          {problems.map((problem) => (
            <li key={problem} className="text-xs font-semibold text-danger">
              {problem}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
