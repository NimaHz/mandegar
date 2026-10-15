"use client";

import { Check, ImageOff, LoaderCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import type { AdminMedia, AdminMediaRef, MediaKind } from "@/types/admin";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { MediaThumb } from "./media-thumb";

const copy = adminContent.mediaField;

interface MediaPickerProps {
  open: boolean;
  onClose: () => void;
  kind: MediaKind;
  onPick: (media: AdminMediaRef) => void;
  selectedId?: string | null;
}

interface PickerState {
  items: AdminMedia[];
  page: number;
  pageCount: number;
}

export function MediaPicker({ open, onClose, kind, onPick, selectedId }: MediaPickerProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [state, setState] = useState<PickerState | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      const { data } = await apiClient.api.admin.media.get({ query: { kind, q: query, page } });
      if (cancelled) return;
      setLoading(false);
      if (data)
        setState((current) => ({
          items: page > 1 && current ? [...current.items, ...data.items] : data.items,
          page: data.page,
          pageCount: data.pageCount,
        }));
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, kind, query, page]);

  return (
    <Sheet open={open} onClose={onClose} title={copy.libraryTitle}>
      <div className="flex flex-col gap-4">
        <Field
          label={adminContent.common.search}
          hideLabel
          type="search"
          icon={Search}
          placeholder={copy.librarySearch}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
          className="h-11"
        />
        {state && state.items.length === 0 && !loading ? (
          <p className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
            <ImageOff className="size-6" aria-hidden />
            {copy.libraryEmpty}
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {state?.items.map((item) => {
              const selected = item.id === selectedId;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onPick(item);
                      onClose();
                    }}
                    aria-pressed={selected}
                    aria-label={item.alt.fa || item.originalName || item.storageKey}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-field border bg-sunken transition-[border-color,box-shadow]",
                      selected
                        ? "border-primary ring-3 ring-primary/25"
                        : "border-line hover:border-ink/50",
                    )}
                  >
                    <MediaThumb media={item} sizes="(min-width: 640px) 8rem, 30vw" />
                    {item.kind !== "image" && (
                      <span className="absolute inset-x-1 bottom-1 truncate rounded-md bg-surface/90 px-1.5 py-0.5 text-2xs font-bold text-ink">
                        {item.originalName ?? item.storageKey}
                      </span>
                    )}
                    {selected && (
                      <span className="absolute end-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-primary text-on-primary">
                        <Check className="size-3.5" strokeWidth={3} aria-hidden />
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
        {loading && (
          <p
            role="status"
            className="flex items-center justify-center gap-2 py-2 text-xs text-muted"
          >
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            {adminContent.common.loading}
          </p>
        )}
        {state && state.page < state.pageCount && !loading && (
          <Button
            variant="line"
            size="sm"
            onClick={() => setPage(state.page + 1)}
            className="self-center"
          >
            {copy.loadMore}
            <span className="text-muted">
              ({faNumber(state.page)}/{faNumber(state.pageCount)})
            </span>
          </Button>
        )}
      </div>
    </Sheet>
  );
}
