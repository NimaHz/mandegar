"use client";

import { Archive, ArchiveRestore, Mail, MailOpen, Phone, Reply } from "lucide-react";
import { useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import type { AdminContactMessage, ContactStatus } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { contactStatusTone } from "../../config";
import { adminContent } from "../../content";
import { enumOptions, sortOptions } from "../../lib/options";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { DeleteAction, IconAction } from "../data/row-actions";
import { StatusBadge } from "../data/status-badge";
import { CodeText } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.messages;
const { statuses, common } = adminContent;

interface MessagesListProps {
  result: Paginated<AdminContactMessage>;
  filtered: boolean;
  canWrite: boolean;
}

const mailto = (message: AdminContactMessage) =>
  message.email
    ? `mailto:${message.email}?subject=${encodeURIComponent(fill(copy.replySubject, { subject: message.subject }))}`
    : null;

export function MessagesList({ result, filtered, canWrite }: MessagesListProps) {
  const { run } = useAdminMutation();
  const [open, setOpen] = useState<AdminContactMessage | null>(null);

  const setStatus = (message: AdminContactMessage, status: ContactStatus, announce = true) =>
    run(() => apiClient.api.admin.messages({ id: message.id }).patch({ status }), {
      success: announce ? copy.updated : undefined,
    });

  const openMessage = (message: AdminContactMessage) => {
    setOpen(message);
    if (canWrite && message.status === "new") void setStatus(message, "read", false);
  };

  const columns: Column<AdminContactMessage>[] = [
    {
      key: "subject",
      header: copy.columns.subject,
      mobile: "primary",
      className: "min-w-64",
      cell: (message) => (
        <button
          type="button"
          onClick={() => openMessage(message)}
          className="flex min-w-0 flex-col gap-1 text-start"
        >
          <span
            className={cn(
              "line-clamp-1 text-sm text-ink hover:text-primary",
              message.status === "new" ? "font-black" : "font-bold",
            )}
          >
            {message.status === "new" && (
              <span
                className="me-1.5 inline-block size-2 rounded-full bg-primary align-middle"
                aria-hidden
              />
            )}
            <bdi>{message.subject}</bdi>
          </span>
          <span dir="auto" className="line-clamp-1 text-start text-caption text-muted">
            {message.body}
          </span>
        </button>
      ),
    },
    {
      key: "sender",
      header: copy.columns.sender,
      cell: (message) => (
        <span className="flex min-w-0 flex-col gap-0.5">
          <bdi className="truncate font-bold text-ink">{message.name}</bdi>
          <CodeText className="text-caption text-muted">{message.phone}</CodeText>
        </span>
      ),
    },
    {
      key: "department",
      header: copy.columns.department,
      cell: (message) => (
        <StatusBadge tone="chip" label={statuses.department[message.department]} dot={false} />
      ),
    },
    {
      key: "status",
      header: common.status,
      cell: (message) => (
        <StatusBadge
          tone={contactStatusTone[message.status]}
          label={statuses.contact[message.status]}
        />
      ),
    },
    {
      key: "date",
      header: copy.columns.date,
      className: "whitespace-nowrap",
      cell: (message) => formatDateTime("fa", message.createdAt),
    },
  ];

  const actions = (message: AdminContactMessage) => (
    <>
      {mailto(message) && (
        <a
          href={mailto(message) ?? undefined}
          aria-label={`${copy.reply}: ${message.subject}`}
          title={copy.reply}
          className="icon-btn size-9"
        >
          <Reply className="size-4.5" strokeWidth={1.9} aria-hidden />
        </a>
      )}
      {canWrite && (
        <>
          <IconAction
            label={message.status === "new" ? copy.markRead : copy.markNew}
            icon={message.status === "new" ? MailOpen : Mail}
            onClick={() => void setStatus(message, message.status === "new" ? "read" : "new")}
          />
          <IconAction
            label={message.status === "archived" ? copy.unarchive : copy.archive}
            icon={message.status === "archived" ? ArchiveRestore : Archive}
            onClick={() =>
              void setStatus(message, message.status === "archived" ? "read" : "archived")
            }
          />
          <DeleteAction
            label={message.subject}
            onConfirm={() =>
              void run(() => apiClient.api.admin.messages({ id: message.id }).delete(), {
                success: common.deleted,
              })
            }
          />
        </>
      )}
    </>
  );

  return (
    <ListFrame
      heading={
        <PanelHeading
          eyebrow={adminContent.shell.groups.service}
          title={copy.title}
          description={copy.description}
        />
      }
      toolbar={
        <ListToolbar
          searchPlaceholder={copy.search}
          filters={[
            { key: "status", label: copy.filters.status, options: enumOptions(statuses.contact) },
            {
              key: "department",
              label: copy.filters.department,
              options: enumOptions(statuses.department),
            },
          ]}
          sort={sortOptions("messages")}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty
          filtered={filtered}
          icon={Mail}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(message) => message.id}
            rowClassName={(message) =>
              message.status === "new" ? "bg-primary-soft/25" : undefined
            }
            actions={actions}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
      <Sheet
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open?.subject ?? copy.detail}
      >
        {open && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone="chip" label={statuses.department[open.department]} dot={false} />
              <span className="text-caption text-muted">
                {formatDateTime("fa", open.createdAt)}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-2 rounded-field bg-sunken/70 p-3 text-sm sm:grid-cols-2">
              <div className="flex flex-col gap-0.5">
                <dt className="text-caption text-muted">{copy.columns.sender}</dt>
                <dd className="font-bold text-ink">
                  <bdi>{open.name}</bdi>
                </dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-caption text-muted">{adminContent.tickets.detail.phone}</dt>
                <dd>
                  <a href={`tel:${open.phone}`} className="font-code font-bold text-primary">
                    <bdi dir="ltr">{open.phone}</bdi>
                  </a>
                </dd>
              </div>
              {open.email && (
                <div className="flex flex-col gap-0.5 sm:col-span-2">
                  <dt className="text-caption text-muted">{adminContent.tickets.detail.email}</dt>
                  <dd className="font-bold text-ink">
                    <bdi dir="ltr">{open.email}</bdi>
                  </dd>
                </div>
              )}
            </dl>
            <p dir="auto" className="text-start text-sm leading-8 whitespace-pre-line text-body">
              {open.body}
            </p>
            <div className="flex flex-wrap gap-2 border-t border-line pt-4">
              {mailto(open) && (
                <a href={mailto(open) ?? undefined} className={buttonVariants({ size: "sm" })}>
                  <Reply className="size-4" aria-hidden />
                  {copy.reply}
                </a>
              )}
              <a
                href={`tel:${open.phone}`}
                className={buttonVariants({ size: "sm", variant: "line" })}
              >
                <Phone className="size-4" aria-hidden />
                {copy.call}
              </a>
            </div>
          </div>
        )}
      </Sheet>
    </ListFrame>
  );
}
