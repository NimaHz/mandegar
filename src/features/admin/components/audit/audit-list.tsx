"use client";

import { FileClock, FileSearch } from "lucide-react";
import { useState } from "react";

import { Sheet } from "@/components/ui/sheet";
import { formatDateTime } from "@/lib/dates";
import type { AdminAuditLog, AdminOption } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { toOptions } from "../../lib/options";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { IconAction } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";
import { UserAvatar } from "../shell/user-avatar";
import { auditActionLabel, auditEntityLabel } from "./audit-labels";
import { DiffViewer } from "./diff-viewer";

const copy = adminContent.audit;

interface AuditListProps {
  result: Paginated<AdminAuditLog>;
  actors: AdminOption[];
  filtered: boolean;
}

const actionTone = (action: string) =>
  action === "delete"
    ? "danger"
    : action === "create"
      ? "success"
      : action === "login.throttled"
        ? "warning"
        : action === "login" || action === "session.revoke"
          ? "chip"
          : "primary";

export function AuditList({ result, actors, filtered }: AuditListProps) {
  const [open, setOpen] = useState<AdminAuditLog | null>(null);

  const columns: Column<AdminAuditLog>[] = [
    {
      key: "actor",
      header: copy.columns.actor,
      mobile: "primary",
      cell: (log) => (
        <span className="flex items-center gap-2.5">
          <UserAvatar name={log.actor?.name ?? copy.system} className="size-8 text-xs" />
          <bdi className="truncate font-bold text-ink">{log.actor?.name ?? copy.system}</bdi>
        </span>
      ),
    },
    {
      key: "action",
      header: copy.columns.action,
      cell: (log) => (
        <StatusBadge tone={actionTone(log.action)} label={auditActionLabel(log.action)} />
      ),
    },
    {
      key: "entity",
      header: copy.columns.entity,
      cell: (log) => (
        <span className="flex flex-col gap-0.5">
          <span className="font-bold text-ink">{auditEntityLabel(log.entity)}</span>
          {log.entityId && (
            <CodeText className="text-2xs text-muted">{log.entityId.slice(0, 8)}</CodeText>
          )}
        </span>
      ),
    },
    {
      key: "date",
      header: copy.columns.date,
      className: "whitespace-nowrap",
      cell: (log) => formatDateTime("fa", log.createdAt),
    },
  ];

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.settings}
          title={copy.title}
          description={copy.description}
        />
      }
      toolbar={
        <ListToolbar
          searchPlaceholder={copy.search}
          filters={[
            {
              key: "entity",
              label: copy.columns.entity,
              options: Object.entries(copy.entities).map(([value, label]) => ({ value, label })),
            },
            { key: "actorId", label: copy.columns.actor, options: toOptions(actors) },
          ]}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty filtered={filtered} icon={FileClock} title={copy.emptyTitle} />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(log) => log.id}
            actions={(log) => (
              <IconAction label={copy.diff} icon={FileSearch} onClick={() => setOpen(log)} />
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      <Sheet open={open !== null} onClose={() => setOpen(null)} title={copy.diffTitle}>
        {open && (
          <div className="flex flex-col gap-4">
            <dl className="grid grid-cols-2 gap-2 text-sm">
              {[
                { label: copy.columns.actor, value: open.actor?.name ?? copy.system },
                { label: copy.columns.action, value: auditActionLabel(open.action) },
                { label: copy.columns.entity, value: auditEntityLabel(open.entity) },
                { label: copy.columns.date, value: formatDateTime("fa", open.createdAt) },
                { label: copy.entityId, value: open.entityId ?? "—", code: true },
                { label: copy.ip, value: open.ip ?? "—", code: true },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex min-w-0 flex-col gap-0.5 rounded-field border border-line px-3 py-2"
                >
                  <dt className="text-caption text-muted">{row.label}</dt>
                  <dd className="truncate font-bold text-ink">
                    {row.code ? <CodeText className="text-xs">{row.value}</CodeText> : row.value}
                  </dd>
                </div>
              ))}
            </dl>
            {open.userAgent && (
              <p className="rounded-field bg-sunken/70 px-3 py-2 text-caption text-muted">
                <span className="font-bold text-ink">{copy.userAgent}: </span>
                <bdi dir="ltr">{open.userAgent}</bdi>
              </p>
            )}
            <section className="flex flex-col gap-2">
              <h3 className="text-label font-extrabold text-ink">{copy.diff}</h3>
              <DiffViewer value={open.diff} empty={copy.noDiff} />
            </section>
          </div>
        )}
      </Sheet>
    </ListFrame>
  );
}
