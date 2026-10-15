"use client";

import { FileText, Film, ImageIcon, LoaderCircle, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useId, useRef, useState } from "react";

import { useSharedTransition } from "@/components/providers/transition-provider";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { toast } from "@/components/ui/toast";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import type { AdminMedia, MediaKind } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { faNumber, formatBytes } from "../../lib/format";
import { acceptFor, uploadMedia } from "../../lib/upload";
import { notifyError } from "../../lib/use-admin-mutation";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { PanelHeading } from "../panel-heading";
import { MediaDetailSheet } from "./media-detail-sheet";
import { MediaThumb } from "./media-thumb";

const copy = adminContent.media;
const { statuses, common } = adminContent;

interface UploadItem {
  id: string;
  name: string;
  progress: number;
}

function KindFilter() {
  const { startTransition } = useSharedTransition();
  const [kind, setKind] = useQueryState(
    "kind",
    parseAsString.withDefault("").withOptions({ shallow: false, startTransition }),
  );
  const options = [
    { value: "", label: common.all },
    ...(["image", "video", "document"] as const).map((value) => ({
      value,
      label: statuses.mediaKind[value],
    })),
  ];
  return (
    <SegmentedControl
      options={options}
      value={kind}
      onChange={(value) => void setKind(value || null)}
      label={adminContent.common.filters}
    />
  );
}

const kindIcon: Record<MediaKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: Film,
  document: FileText,
};

export function MediaLibrary({
  result,
  filtered,
  canWrite,
}: {
  result: Paginated<AdminMedia>;
  filtered: boolean;
  canWrite: boolean;
}) {
  const router = useRouter();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState<AdminMedia | null>(null);

  const onFiles = async (files: FileList | null) => {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    const queue = list.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      progress: 0,
    }));
    setUploads((current) => [...current, ...queue]);
    let done = 0;
    for (const [index, file] of list.entries()) {
      const entry = queue[index];
      if (!entry) continue;
      const result = await uploadMedia(file, {
        onProgress: (progress) =>
          setUploads((current) =>
            current.map((item) => (item.id === entry.id ? { ...item, progress } : item)),
          ),
      });
      setUploads((current) => current.filter((item) => item.id !== entry.id));
      if (result.ok) done += 1;
      else notifyError(result.error);
    }
    if (done > 0) {
      toast({ title: fill(copy.uploaded, { count: faNumber(done) }), tone: "success" });
      router.refresh();
    }
  };

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.catalog}
          title={copy.title}
          description={copy.description}
          action={
            canWrite && (
              <Button onClick={() => inputRef.current?.click()}>
                <Upload className="size-4" aria-hidden />
                {copy.upload}
              </Button>
            )
          }
        />
      }
      toolbar={
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <KindFilter />
          <ListToolbar searchPlaceholder={copy.search} className="xl:w-[26rem]" />
        </div>
      }
    >
      {canWrite && (
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
            "flex flex-col gap-3 rounded-card border border-dashed px-4 py-4 transition-colors",
            dragging ? "border-primary bg-primary-soft/60" : "border-line-strong bg-surface/60",
          )}
        >
          <label
            htmlFor={inputId}
            className="flex cursor-pointer items-center justify-center gap-2 py-2 text-sm font-bold text-muted"
          >
            <Upload className="size-4" aria-hidden />
            {copy.dropHint}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            multiple
            accept={acceptFor(["image", "video", "document"])}
            className="sr-only"
            onChange={(event) => {
              void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
          {uploads.length > 0 && (
            <ul className="flex flex-col gap-2" role="status">
              {uploads.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-field bg-raised px-3 py-2"
                >
                  <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" aria-hidden />
                  <span className="min-w-0 flex-1 truncate text-xs font-bold text-ink">
                    {fill(copy.uploading, { name: item.name })}
                  </span>
                  <ProgressBar
                    value={item.progress * 100}
                    label={item.name}
                    className="h-1.5 w-32"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {result.items.length === 0 ? (
        <ListEmpty
          filtered={filtered}
          icon={ImageIcon}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {result.items.map((item) => {
              const Icon = kindIcon[item.kind];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(item)}
                    className="group flex w-full card-interactive flex-col overflow-hidden card text-start shadow-card"
                  >
                    <span className="relative block aspect-[4/3] bg-sunken">
                      <MediaThumb
                        media={item}
                        sizes="(min-width: 1536px) 16rem, (min-width: 1024px) 22vw, 45vw"
                      />
                      <span className="absolute start-2 top-2 inline-flex h-6 items-center gap-1 rounded-full bg-surface/90 px-2 text-2xs font-extrabold text-ink backdrop-blur">
                        <Icon className="size-3" aria-hidden />
                        {statuses.mediaKind[item.kind]}
                      </span>
                      {!item.alt.fa && item.kind === "image" && (
                        <span
                          className="absolute end-2 top-2 size-2 rounded-full bg-warning ring-2 ring-surface"
                          aria-hidden
                        />
                      )}
                    </span>
                    <span className="flex flex-col gap-0.5 p-3">
                      <span className="truncate text-xs font-bold text-ink" dir="auto">
                        {item.alt.fa || item.originalName || item.storageKey}
                      </span>
                      <span className="text-caption text-muted">
                        {formatBytes(item.size)}
                        {item.width && item.height
                          ? ` · ${faNumber(item.width)}×${faNumber(item.height)}`
                          : ""}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      {selected && (
        <MediaDetailSheet
          key={selected.id}
          media={selected}
          canWrite={canWrite}
          onClose={() => setSelected(null)}
        />
      )}
    </ListFrame>
  );
}
