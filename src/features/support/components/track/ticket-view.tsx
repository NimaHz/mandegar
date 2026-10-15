"use client";

import { ArrowRight, Lock, MessagesSquare, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CopyButton } from "@/components/shared/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { FocusHeading } from "@/features/warranty/components/focus-heading";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { apiClient, apiResult } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { routes } from "@/lib/routes";
import { formatTrackingCode } from "@/lib/tracking-code";
import type { PublicTicket, TicketStatus, TicketType, TrackTicketInput } from "@/types/support";

import type { TrackContent } from "../../content";
import { statusMeta, toneClasses } from "../../ticket-status";
import type { AttachmentLabels } from "../attachment-picker";
import { MessageThread } from "./message-thread";
import { ReplyForm } from "./reply-form";
import { StatusStepper } from "./status-stepper";

type Labeled = { label: string; description: string };

interface TicketViewProps {
  locale: Locale;
  ticket: PublicTicket;
  source: TrackTicketInput;
  copy: TrackContent;
  statuses: Record<TicketStatus, Labeled>;
  types: Record<TicketType, Labeled>;
  attachmentLabels: AttachmentLabels;
  onUpdate: (ticket: PublicTicket) => void;
  onReset?: () => void;
}

const OPEN = (status: TicketStatus) => status !== "closed" && status !== "rejected";

export function TicketView({
  locale,
  ticket,
  source,
  copy,
  statuses,
  types,
  attachmentLabels,
  onUpdate,
  onReset,
}: TicketViewProps) {
  const [refreshing, setRefreshing] = useState(false);
  const meta = statusMeta[ticket.status];
  const tone = toneClasses[meta.tone];
  const StatusIcon = meta.icon;
  const code = formatTrackingCode(ticket.trackingCode);
  const none = <span className="text-muted">{copy.view.none}</span>;

  const refresh = async () => {
    setRefreshing(true);
    const result = await apiResult(apiClient.api.tickets.track.post({ ...source, locale }));
    setRefreshing(false);
    if (result.ok) {
      onUpdate(result.data);
      toast({ title: copy.view.refreshed, tone: "info" });
    } else {
      toast({ title: copy.view.refreshFailed, tone: "danger" });
    }
  };

  const facts = [
    { label: copy.view.type, value: types[ticket.type].label },
    {
      label: copy.view.product,
      wide: true,
      value: ticket.product ? (
        <Link
          href={localizePath(locale, routes.product(ticket.product.slug))}
          className="underline decoration-line-strong underline-offset-4 hover:text-primary hover:decoration-primary"
        >
          {ticket.product.name}
        </Link>
      ) : (
        none
      ),
    },
    {
      label: copy.view.warrantyCode,
      value: ticket.warrantyCode ? (
        <bdi dir="ltr" className="font-code">
          {ticket.warrantyCode}
        </bdi>
      ) : (
        none
      ),
    },
    {
      label: copy.view.phone,
      value: (
        <bdi dir="ltr" className="font-code">
          {ticket.maskedPhone}
        </bdi>
      ),
    },
    {
      label: copy.view.created,
      value: <time dateTime={ticket.createdAt}>{formatDateTime(locale, ticket.createdAt)}</time>,
    },
    {
      label: copy.view.updated,
      value: <time dateTime={ticket.updatedAt}>{formatDateTime(locale, ticket.updatedAt)}</time>,
    },
  ];

  return (
    <article
      aria-labelledby="ticket-subject"
      className="overflow-hidden panel bg-raised shadow-lift"
    >
      <header className="flex flex-col gap-5 border-b border-line p-5 sm:flex-row sm:items-start sm:justify-between sm:p-7">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-caption font-semibold text-muted">{copy.view.codeLabel}</span>
            <bdi dir="ltr" className="font-code text-base font-bold tracking-[0.14em] text-ink">
              {code}
            </bdi>
            <CopyButton value={code} label={copy.view.codeLabel} className="size-8" />
          </div>
          <FocusHeading
            id="ticket-subject"
            dir="auto"
            className="font-display text-xl leading-snug font-black text-ink sm:text-2xl"
          >
            {ticket.subject}
          </FocusHeading>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-extrabold",
              tone.soft,
            )}
          >
            <StatusIcon className="size-4.5" aria-hidden />
            {statuses[ticket.status].label}
          </span>
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={refreshing}
            aria-label={copy.view.refresh}
            title={copy.view.refresh}
            className="icon-btn size-10 border border-line bg-surface disabled:opacity-60"
          >
            <RefreshCw className={cn("size-4.5", refreshing && "animate-spin")} aria-hidden />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6 p-5 sm:p-7 lg:order-2 lg:border-s lg:border-line lg:bg-surface">
          <section aria-labelledby="ticket-progress-title" className="flex flex-col gap-4">
            <h3 id="ticket-progress-title" className="text-sm font-extrabold text-ink">
              {copy.view.progressLabel}
            </h3>
            <StatusStepper status={ticket.status} label={copy.view.progressLabel} copy={statuses} />
          </section>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3.5 border-t border-line pt-5">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className={cn("flex min-w-0 flex-col gap-0.5", "wide" in fact && "col-span-2")}
              >
                <dt className="text-caption font-semibold text-muted">{fact.label}</dt>
                <dd className="text-sm font-semibold break-words text-ink">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-6 border-t border-line p-5 sm:p-7 lg:order-1 lg:border-t-0">
          <section aria-labelledby="ticket-thread-title" className="flex flex-col gap-5">
            <h3
              id="ticket-thread-title"
              className="inline-flex items-center gap-2 text-sm font-extrabold text-ink"
            >
              <MessagesSquare className="size-4.5 text-primary" aria-hidden />
              {copy.thread.title}
            </h3>
            <MessageThread
              locale={locale}
              messages={ticket.messages}
              copy={copy.thread}
              statuses={statuses}
            />
          </section>

          <section
            aria-labelledby="ticket-reply-title"
            className="flex flex-col gap-4 border-t border-line pt-6"
          >
            <h3 id="ticket-reply-title" className="text-sm font-extrabold text-ink">
              {copy.reply.title}
            </h3>
            {ticket.canReply && "token" in source ? (
              <ReplyForm
                locale={locale}
                trackingCode={ticket.trackingCode}
                token={source.token}
                copy={copy.reply}
                attachmentLabels={attachmentLabels}
                onReplied={onUpdate}
              />
            ) : OPEN(ticket.status) ? (
              <p className="flex items-start gap-2.5 rounded-field bg-sunken p-4 text-sm leading-7 text-body">
                <Lock className="mt-1 size-4 shrink-0 text-muted" aria-hidden />
                {copy.reply.cannotReply}
              </p>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-field bg-sunken p-4">
                <p className="text-sm leading-7 text-body">{copy.reply.closedNote}</p>
                <Link
                  href={localizePath(locale, routes.serviceRequest)}
                  className={buttonVariants({ variant: "line", size: "sm" })}
                >
                  {copy.reply.newRequest}
                </Link>
              </div>
            )}
          </section>

          {onReset && (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 self-start rounded-control px-2 py-1.5 text-sm font-bold text-primary transition-colors hover:bg-primary-soft"
            >
              <ArrowRight className="size-4 ltr:rotate-180" aria-hidden />
              {copy.view.another}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
