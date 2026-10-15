"use client";

import { LinkIcon, LoaderCircle } from "lucide-react";
import { useQueryStates } from "nuqs";
import { Suspense, useEffect, useState } from "react";

import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { apiClient, apiResult } from "@/lib/api-client";
import type { PublicTicket, TicketStatus, TicketType, TrackTicketInput } from "@/types/support";

import type { TrackContent } from "../../content";
import { trackSearchParams } from "../../search-params";
import type { AttachmentLabels } from "../attachment-picker";
import { TicketView } from "./ticket-view";
import { TrackForm } from "./track-form";

type Labeled = { label: string; description: string };

interface TrackPanelProps {
  copy: TrackContent;
  statuses: Record<TicketStatus, Labeled>;
  types: Record<TicketType, Labeled>;
  attachmentLabels: AttachmentLabels;
  phonePlaceholder: string;
}

interface TokenTrackProps extends TrackPanelProps {
  token: string;
}

interface Tracked {
  ticket: PublicTicket;
  source: TrackTicketInput;
}

type TokenState = "idle" | "loading" | "invalid";

function TokenTrack({
  token,
  copy,
  statuses,
  types,
  attachmentLabels,
  phonePlaceholder,
}: TokenTrackProps) {
  const locale = useLocale();
  const { common } = useDictionary();
  const [tracked, setTracked] = useState<Tracked | null>(null);
  const [tokenState, setTokenState] = useState<TokenState>(token ? "loading" : "idle");

  useEffect(() => {
    if (!token) return;
    let active = true;
    void apiResult(apiClient.api.tickets.track.post({ token, locale })).then((result) => {
      if (!active) return;
      if (result.ok) setTracked({ ticket: result.data, source: { token } });
      setTokenState(result.ok ? "idle" : "invalid");
    });
    return () => {
      active = false;
    };
  }, [token, locale]);

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

  if (tokenState === "loading") {
    return (
      <div
        role="status"
        className="mx-auto flex w-full max-w-xl items-center justify-center gap-3 panel bg-raised p-8 text-sm font-bold text-muted shadow-lift"
      >
        <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />
        {common.loading}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {tokenState === "invalid" && (
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

function QueryTokenTrack(props: TrackPanelProps) {
  const [{ t: token }] = useQueryStates(trackSearchParams);
  return <TokenTrack key={token} {...props} token={token} />;
}

export function TrackPanel(props: TrackPanelProps) {
  return (
    <Suspense fallback={<TokenTrack {...props} token="" />}>
      <QueryTokenTrack {...props} />
    </Suspense>
  );
}
