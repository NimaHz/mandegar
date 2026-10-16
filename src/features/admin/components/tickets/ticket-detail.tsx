import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CircleDot,
  FileText,
  Lock,
  Mail,
  MapPin,
  MessageSquareText,
  Package,
  Phone,
  QrCode,
  Smartphone,
  UserRound,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { CopyButton } from "@/components/shared/copy-button";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import { formatDate, formatDateTime } from "@/lib/dates";
import { provinceName } from "@/lib/provinces";
import { adminRoutes } from "@/lib/routes";
import { parseStatusEvent, parseUnknownWarranty } from "@/lib/tickets";
import type { AdminOption, AdminTicket, AdminTicketMessage } from "@/types/admin";
import type { TicketStatus } from "@/types/support";

import { warrantyStatusTone } from "../../config";
import { adminContent } from "../../content";
import { faBytes } from "../../lib/format";
import { StatusBadge } from "../data/status-badge";
import { CodeText } from "../data/thumb-cell";
import { MediaThumb } from "../media/media-thumb";
import { PanelCard } from "../panel-card";
import { UserAvatar } from "../shell/user-avatar";
import { ReplyComposer } from "./reply-composer";
import { PriorityBadge, SlaIndicator, TicketStatusBadge } from "./ticket-badges";
import { TicketControls } from "./ticket-controls";

const copy = adminContent.tickets.detail;
const { statuses } = adminContent;

interface TicketDetailProps {
  ticket: AdminTicket;
  assignees: AdminOption[];
  canWrite: boolean;
  canViewWarranty: boolean;
  now: number;
}

const statusEvent = (message: AdminTicketMessage) =>
  message.authorType === "system" ? parseStatusEvent(message.body) : null;

function Attachments({ message }: { message: AdminTicketMessage }) {
  if (message.attachments.length === 0) return null;
  const images = message.attachments.filter((file) => file.kind === "image");
  const documents = message.attachments.filter((file) => file.kind !== "image");
  return (
    <div className="flex flex-col gap-2 pt-1">
      {images.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={copy.attachments}>
          {images.map((file) => (
            <li key={file.id}>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                title={file.name}
                aria-label={`${copy.openAttachment}: ${file.name}`}
                className="relative flex size-20 overflow-hidden rounded-control border border-line bg-sunken transition-[border-color,box-shadow] hover:border-primary focus-visible:ring-3 focus-visible:ring-primary/25"
              >
                <MediaThumb media={file} sizes="5rem" unoptimized />
              </a>
            </li>
          ))}
        </ul>
      )}
      {documents.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={copy.attachments}>
          {documents.map((file) => (
            <li key={file.id}>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex max-w-64 items-center gap-2 rounded-control border border-line bg-surface py-1.5 ps-2 pe-3 transition-colors hover:border-primary hover:text-primary"
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-danger-soft text-danger">
                  <FileText className="size-4" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span dir="auto" className="truncate text-label font-bold">
                    {file.name}
                  </span>
                  <span className="text-2xs text-muted">{faBytes(file.size)}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThreadItem({ message, customer }: { message: AdminTicketMessage; customer: string }) {
  const status = statusEvent(message);
  if (status)
    return (
      <li className="flex items-center gap-3 py-1">
        <span className="h-px flex-1 bg-line" />
        <span className="inline-flex items-center gap-2 text-caption font-bold text-muted">
          <CircleDot className="size-3.5" aria-hidden />
          {fill(copy.statusChanged, { status: statuses.ticket[status] })}
          <span className="font-normal">{formatDateTime("fa", message.createdAt)}</span>
        </span>
        <span className="h-px flex-1 bg-line" />
      </li>
    );
  const unknownCode = message.authorType === "system" ? parseUnknownWarranty(message.body) : null;
  const staff = message.authorType === "staff";
  const name =
    message.author?.name ??
    (message.authorType === "customer" ? customer : statuses.author[message.authorType]);

  return (
    <li className={cn("flex gap-3", staff && "flex-row-reverse")}>
      <UserAvatar
        name={name}
        className={cn(
          "size-8 text-xs",
          !staff && "bg-chip text-ink",
          message.internal && "bg-warning text-on-accent",
        )}
      />
      <div
        className={cn(
          "flex max-w-[85%] min-w-0 flex-col gap-1.5 rounded-card px-4 py-3",
          message.internal
            ? "border border-dashed border-warning/50 bg-warning-soft"
            : staff
              ? "rounded-se-md bg-primary-soft"
              : "rounded-ss-md border border-line bg-raised",
        )}
      >
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
          <span className="font-extrabold text-ink">{name}</span>
          {message.internal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-warning px-2 py-0.5 text-2xs font-extrabold text-on-accent">
              <Lock className="size-3" aria-hidden />
              {copy.internalBadge}
            </span>
          )}
          <span className="text-muted">{formatDateTime("fa", message.createdAt)}</span>
        </span>
        <p dir="auto" className="text-start text-sm leading-7 whitespace-pre-line text-ink-soft">
          {unknownCode ? fill(copy.unknownWarranty, { code: unknownCode }) : message.body}
        </p>
        <Attachments message={message} />
      </div>
    </li>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="icon-tile size-8 bg-sunken text-muted">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <dt className="text-caption text-muted">{label}</dt>
        <dd className="min-w-0 text-sm font-bold text-ink">{children}</dd>
      </div>
    </div>
  );
}

interface TimelineEntry {
  label: string;
  at: string;
  tone: "done" | "due" | "late";
}

export function TicketDetail({
  ticket,
  assignees,
  canWrite,
  canViewWarranty,
  now,
}: TicketDetailProps) {
  const thread = ticket.messages;
  const statusChanges = thread.flatMap((message) => {
    const status = statusEvent(message);
    return status ? [{ status, at: message.createdAt }] : [];
  });
  const timeline: TimelineEntry[] = [
    { label: copy.created, at: ticket.createdAt, tone: "done" as const },
    ticket.firstRespondedAt
      ? { label: copy.firstResponded, at: ticket.firstRespondedAt, tone: "done" as const }
      : {
          label: adminContent.tickets.sla.firstResponse,
          at: ticket.firstResponseDue,
          tone:
            new Date(ticket.firstResponseDue).getTime() < now
              ? ("late" as const)
              : ("due" as const),
        },
    ...statusChanges.map((change: { status: TicketStatus; at: string }) => ({
      label: statuses.ticket[change.status],
      at: change.at,
      tone: "done" as const,
    })),
    ticket.resolvedAt
      ? { label: copy.resolved, at: ticket.resolvedAt, tone: "done" as const }
      : ticket.closedAt
        ? { label: copy.closed, at: ticket.closedAt, tone: "done" as const }
        : {
            label: adminContent.tickets.sla.resolution,
            at: ticket.resolutionDue,
            tone:
              new Date(ticket.resolutionDue).getTime() < now ? ("late" as const) : ("due" as const),
          },
  ].toSorted((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-control bg-sunken px-2.5 py-1">
            <CodeText className="text-label font-bold text-ink">
              {ticket.formattedTrackingCode}
            </CodeText>
            <CopyButton
              value={ticket.trackingCode}
              label={copy.copyCode}
              className="size-6 bg-transparent"
            />
          </span>
          <span className="text-xs font-bold text-muted">{statuses.ticketType[ticket.type]}</span>
        </div>
        <h1 className="font-display text-[1.625rem] leading-tight font-black text-balance text-ink sm:text-[1.875rem]">
          {ticket.subject}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <TicketStatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="mx-1 h-4 w-px bg-line" aria-hidden />
          <SlaIndicator ticket={ticket} now={now} />
        </div>
      </header>

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_21rem] xl:gap-5">
        <div className="flex min-w-0 flex-col gap-4">
          <PanelCard title={copy.description} icon={FileText}>
            <p dir="auto" className="text-start text-sm leading-8 whitespace-pre-line text-body">
              {ticket.description}
            </p>
          </PanelCard>

          <PanelCard title={copy.thread} icon={MessageSquareText}>
            {thread.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">{copy.emptyThread}</p>
            ) : (
              <ol className="flex flex-col gap-4">
                {thread.map((message) => (
                  <ThreadItem key={message.id} message={message} customer={ticket.name} />
                ))}
              </ol>
            )}
          </PanelCard>

          {canWrite && <ReplyComposer ticket={ticket} />}
        </div>

        <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-24">
          {canWrite && (
            <TicketControls key={ticket.updatedAt} ticket={ticket} assignees={assignees} />
          )}

          <PanelCard title={copy.customer} icon={UserRound}>
            <dl className="flex flex-col gap-3.5">
              <InfoRow icon={UserRound} label={copy.customer}>
                <bdi>{ticket.name}</bdi>
              </InfoRow>
              <InfoRow icon={Phone} label={copy.phone}>
                <span className="flex items-center gap-1.5">
                  <bdi dir="ltr" className="font-code tracking-wide">
                    {ticket.phone}
                  </bdi>
                  <CopyButton value={ticket.phone} label={copy.copyPhone} className="size-7" />
                  <a
                    href={`tel:${ticket.phone}`}
                    aria-label={`${copy.call} ${ticket.phone}`}
                    className="icon-btn size-7 bg-chip/70"
                  >
                    <Phone className="size-3.5" aria-hidden />
                  </a>
                  <a
                    href={`sms:${ticket.phone}`}
                    aria-label={`${copy.sms} ${ticket.phone}`}
                    className="icon-btn size-7 bg-chip/70"
                  >
                    <Smartphone className="size-3.5" aria-hidden />
                  </a>
                </span>
              </InfoRow>
              {ticket.email && (
                <InfoRow icon={Mail} label={copy.email}>
                  <a href={`mailto:${ticket.email}`} className="text-primary hover:underline">
                    <bdi dir="ltr">{ticket.email}</bdi>
                  </a>
                </InfoRow>
              )}
              <InfoRow icon={MapPin} label={copy.location}>
                <span className="flex flex-col gap-0.5">
                  <span>
                    {provinceName("fa", ticket.province)}، {ticket.city}
                  </span>
                  <span dir="auto" className="text-start text-xs leading-6 font-normal text-body">
                    {ticket.address}
                  </span>
                </span>
              </InfoRow>
            </dl>
          </PanelCard>

          <PanelCard title={copy.product} icon={Package}>
            <dl className="flex flex-col gap-3.5">
              <InfoRow icon={Package} label={copy.product}>
                {ticket.product ? (
                  <Link
                    href={adminRoutes.product(ticket.product.id) as Route}
                    className="flex flex-col gap-0.5 hover:text-primary"
                  >
                    {ticket.product.name.fa}
                    <CodeText className="text-caption font-normal text-muted">
                      {ticket.product.modelCode}
                    </CodeText>
                  </Link>
                ) : (
                  <span className="font-normal text-muted">{copy.noProduct}</span>
                )}
              </InfoRow>
              <InfoRow icon={QrCode} label={copy.warrantyCode}>
                {ticket.warrantyCode ? (
                  <span className="flex flex-wrap items-center gap-2">
                    {canViewWarranty ? (
                      <Link
                        href={`${adminRoutes.warranty}?q=${ticket.warrantyCode.code}` as Route}
                        className="hover:text-primary"
                      >
                        <CodeText className="tracking-wider">
                          {ticket.warrantyCode.formatted}
                        </CodeText>
                      </Link>
                    ) : (
                      <CodeText className="tracking-wider">
                        {ticket.warrantyCode.formatted}
                      </CodeText>
                    )}
                    <StatusBadge
                      tone={warrantyStatusTone[ticket.warrantyCode.status]}
                      label={statuses.warranty[ticket.warrantyCode.status]}
                    />
                  </span>
                ) : (
                  <span className="font-normal text-muted">{copy.noCode}</span>
                )}
              </InfoRow>
              {ticket.purchaseDate && (
                <InfoRow icon={CalendarClock} label={copy.purchaseDate}>
                  {formatDate("fa", ticket.purchaseDate)}
                </InfoRow>
              )}
            </dl>
          </PanelCard>

          <PanelCard title={copy.timeline} icon={CalendarClock}>
            <ol className="relative flex flex-col gap-4 ps-5 before:absolute before:inset-y-1.5 before:start-[0.3125rem] before:w-px before:bg-line">
              {timeline.map((entry) => (
                <li key={`${entry.label}-${entry.at}`} className="relative flex flex-col gap-0.5">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -start-5 top-1 size-2.5 rounded-full ring-4 ring-surface",
                      entry.tone === "done" && "bg-primary",
                      entry.tone === "due" && "border-2 border-line-strong bg-surface",
                      entry.tone === "late" && "bg-danger",
                    )}
                  />
                  <span
                    className={cn(
                      "text-label font-bold",
                      entry.tone === "late"
                        ? "text-danger"
                        : entry.tone === "due"
                          ? "text-muted"
                          : "text-ink",
                    )}
                  >
                    {entry.label}
                  </span>
                  <span className="text-caption text-muted">{formatDateTime("fa", entry.at)}</span>
                </li>
              ))}
            </ol>
          </PanelCard>
        </aside>
      </div>
    </div>
  );
}
