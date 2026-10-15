"use client";

import { ExternalLink, LoaderCircle, Save, Trash } from "lucide-react";
import { useEffect, useState } from "react";

import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Field } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/dates";
import type { AdminMedia, AdminMediaUsage } from "@/types/admin";

import { adminContent } from "../../content";
import { faNumber, formatBytes, formatClock } from "../../lib/format";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { auditEntityLabel } from "../audit/audit-labels";
import { MediaThumb } from "./media-thumb";

const copy = adminContent.media;

interface MediaDetailSheetProps {
  media: AdminMedia;
  canWrite: boolean;
  onClose: () => void;
}

export function MediaDetailSheet({ media, canWrite, onClose }: MediaDetailSheetProps) {
  const { run, pending } = useAdminMutation();
  const [alt, setAlt] = useState(media.alt);
  const [usages, setUsages] = useState<AdminMediaUsage[] | null>(null);
  const absoluteUrl = new URL(media.url, siteConfig.url).toString();
  const changed = alt.fa !== media.alt.fa || alt.en !== media.alt.en;

  useEffect(() => {
    let cancelled = false;
    void apiClient.api.admin
      .media({ id: media.id })
      .usages.get()
      .then(({ data }) => {
        if (!cancelled) setUsages(data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [media.id]);

  const rows = [
    { label: copy.type, value: <bdi dir="ltr">{media.mime}</bdi> },
    { label: copy.size, value: formatBytes(media.size) },
    ...(media.width && media.height
      ? [{ label: copy.dimensions, value: `${faNumber(media.width)} × ${faNumber(media.height)}` }]
      : []),
    ...(media.durationSec
      ? [{ label: copy.duration, value: <bdi dir="ltr">{formatClock(media.durationSec)}</bdi> }]
      : []),
    { label: copy.uploadedBy, value: media.uploadedBy?.name ?? adminContent.common.system },
    { label: copy.uploadedAt, value: formatDateTime("fa", media.createdAt) },
  ];
  const inUse = (usages?.length ?? 0) > 0;

  return (
    <Sheet open onClose={onClose} title={copy.detail}>
      <div className="flex flex-col gap-5">
        <div className="relative aspect-[4/3] overflow-hidden rounded-field border border-line bg-sunken">
          {media.kind === "video" ? (
            <video
              src={media.url}
              controls
              preload="metadata"
              className="size-full bg-night object-contain"
            />
          ) : (
            <MediaThumb media={media} sizes="36rem" fit="contain" />
          )}
        </div>
        <div className="flex items-center gap-2 rounded-field bg-sunken/70 p-2 ps-3">
          <bdi dir="ltr" className="min-w-0 flex-1 truncate text-start font-code text-xs text-body">
            {absoluteUrl}
          </bdi>
          <CopyButton value={absoluteUrl} label={copy.copyUrl} className="size-8" />
          <a
            href={media.url}
            target="_blank"
            rel="noreferrer"
            aria-label={copy.open}
            className="icon-btn size-8 bg-chip/70"
          >
            <ExternalLink className="size-4" aria-hidden />
          </a>
        </div>
        <dl className="grid grid-cols-2 gap-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex flex-col gap-0.5 rounded-field border border-line px-3 py-2"
            >
              <dt className="text-caption text-muted">{row.label}</dt>
              <dd className="truncate text-label font-bold text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
        <fieldset disabled={!canWrite} className="flex flex-col gap-3">
          <legend className="mb-2 text-label font-extrabold text-ink">{copy.alt}</legend>
          <Field
            label={adminContent.common.fa}
            value={alt.fa}
            maxLength={200}
            onChange={(event) => setAlt({ ...alt, fa: event.target.value })}
          />
          <Field
            label={adminContent.common.en}
            dir="ltr"
            lang="en"
            value={alt.en}
            maxLength={200}
            onChange={(event) => setAlt({ ...alt, en: event.target.value })}
          />
          {canWrite && (
            <Button
              size="sm"
              className="self-start"
              disabled={!changed || pending}
              onClick={() =>
                void run(() => apiClient.api.admin.media({ id: media.id }).patch({ alt }), {
                  success: copy.altSaved,
                })
              }
            >
              {pending ? (
                <LoaderCircle className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              {adminContent.common.save}
            </Button>
          )}
        </fieldset>
        <section className="flex flex-col gap-2">
          <h3 className="text-label font-extrabold text-ink">{copy.usages}</h3>
          {usages === null ? (
            <LoaderCircle className="size-4 animate-spin text-muted" aria-hidden />
          ) : usages.length === 0 ? (
            <p className="text-xs text-muted">{copy.noUsages}</p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {usages.map((usage) => (
                <li
                  key={`${usage.entity}-${usage.id}`}
                  className="rounded-full bg-chip px-3 py-1 text-caption font-bold text-ink"
                >
                  {auditEntityLabel(usage.entity)} · {usage.label}
                </li>
              ))}
            </ul>
          )}
        </section>
        {canWrite && (
          <div className="flex flex-col gap-2 border-t border-line pt-4">
            {inUse && <p className="text-xs text-warning">{copy.inUse}</p>}
            <ConfirmButton
              label={`${adminContent.common.delete} ${media.originalName ?? media.storageKey}`}
              confirmLabel={adminContent.products.deleteConfirm}
              onConfirm={() =>
                void run(() => apiClient.api.admin.media({ id: media.id }).delete(), {
                  success: adminContent.common.deleted,
                  onSuccess: onClose,
                })
              }
              className="h-10 w-full rounded-control border border-danger/30 text-sm text-danger disabled:opacity-50"
            >
              <Trash className="size-4" aria-hidden />
              {adminContent.common.delete}
            </ConfirmButton>
          </div>
        )}
      </div>
    </Sheet>
  );
}
