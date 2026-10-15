"use client";

import { LinkIcon } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/i18n/locale-provider";
import type { PublicTicket, TicketStatus, TicketType, TrackTicketInput } from "@/types/support";

import type { TrackContent } from "../../content";
import type { AttachmentLabels } from "../attachment-picker";
import { TicketView } from "./ticket-view";
import { TrackForm } from "./track-form";

type Labeled = { label: string; description: string };

interface TrackPanelProps {
  initial: { ticket: PublicTicket; token: string } | null;
  tokenInvalid: boolean;
  copy: TrackContent;
  statuses: Record<TicketStatus, Labeled>;
  types: Record<TicketType, Labeled>;
  attachmentLabels: AttachmentLabels;
  phonePlaceholder: string;
}

interface Tracked {
  ticket: PublicTicket;
  source: TrackTicketInput;
}

export function TrackPanel({
  initial,
  tokenInvalid,
  copy,
  statuses,
  types,
  attachmentLabels,
  phonePlaceholder,
}: TrackPanelProps) {
  const locale = useLocale();
  const [tracked, setTracked] = useState<Tracked | null>(
    initial ? { ticket: initial.ticket, source: { token: initial.token } } : null,
  );

  if (tracked) {
    return (
      <TicketView
        locale={locale}
        ticket={tracked.ticket}
        source={tracked.source}
        copy={copy}
        statuses={statuses}
        types={types}
        attachmentLabels={attachmentLabels}
        onUpdate={(ticket) => setTracked({ ...tracked, ticket })}
        onReset={"token" in tracked.source ? undefined : () => setTracked(null)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tokenInvalid && (
        <div
          role="alert"
          className="mx-auto flex w-full max-w-xl items-start gap-3 rounded-card border border-warning/40 bg-warning-soft/70 p-4"
        >
          <LinkIcon className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-extrabold text-ink">{copy.tokenInvalid.title}</p>
            <p className="text-sm leading-7 text-body">{copy.tokenInvalid.body}</p>
          </div>
        </div>
      )}
      <TrackForm
        locale={locale}
        copy={copy.form}
        phonePlaceholder={phonePlaceholder}
        onFound={(ticket, input) => setTracked({ ticket, source: input })}
      />
    </div>
  );
}
