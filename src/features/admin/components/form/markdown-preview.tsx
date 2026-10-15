"use client";

import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useEffect, useState, useTransition } from "react";

import { cn } from "@/lib/cn";

import { previewMarkdown } from "../../actions";
import { adminContent } from "../../content";

interface MarkdownPreviewProps {
  source: string;
  dir: "rtl" | "ltr";
}

const DEBOUNCE_MS = 350;

export function MarkdownPreview({ source, dir }: MarkdownPreviewProps) {
  const [open, setOpen] = useState(false);
  const [html, setHtml] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      startTransition(async () => setHtml(source.trim() ? await previewMarkdown(source) : ""));
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [open, source]);

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1.5 self-start rounded-lg px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary-soft"
      >
        {open ? (
          <EyeOff className="size-3.5" aria-hidden />
        ) : (
          <Eye className="size-3.5" aria-hidden />
        )}
        {adminContent.common.preview}
        {pending && <LoaderCircle className="size-3.5 animate-spin" aria-hidden />}
      </button>
      {open && (
        <div
          dir={dir}
          className={cn(
            "max-h-[28rem] overflow-y-auto rounded-field border border-dashed border-line-strong bg-raised px-4 py-4 sm:px-6",
            pending && "opacity-70",
          )}
          data-lenis-prevent
        >
          {html ? (
            <div className="prose-mandegar" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-sm text-muted">{adminContent.common.previewEmpty}</p>
          )}
        </div>
      )}
    </div>
  );
}
