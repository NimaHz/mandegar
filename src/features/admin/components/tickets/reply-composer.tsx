"use client";

import { LoaderCircle, Lock, MessageSquareReply, Paperclip, Send, Sparkles } from "lucide-react";
import { type DragEvent, useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Select } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import type { AdminTicket } from "@/types/admin";
import { type TicketStatus, ticketStatuses } from "@/types/support";

import { openTicketStatuses } from "../../config";
import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { ReplyAttachments, useReplyAttachments } from "./reply-attachments";

const copy = adminContent.tickets.composer;
const { statuses } = adminContent;
const MAX = 5000;

type Mode = "reply" | "note";

const afterOptions: TicketStatus[] = [
  "awaiting-customer",
  "scheduled",
  "in-repair",
  "awaiting-parts",
  "resolved",
];

const isStatus = (value: string): value is TicketStatus =>
  ticketStatuses.some((status) => status === value);

const carriesFiles = (event: DragEvent) => event.dataTransfer.types.includes("Files");

export function ReplyComposer({ ticket }: { ticket: AdminTicket }) {
  const id = useId();
  const { run, pending } = useAdminMutation();
  const [mode, setMode] = useState<Mode>("reply");
  const [body, setBody] = useState("");
  const [after, setAfter] = useState<TicketStatus | "">("");
  const [dragging, setDragging] = useState(false);
  const attachments = useReplyAttachments();
  const { files } = attachments;
  const internal = mode === "note";
  const open = openTicketStatuses.includes(ticket.status);
  const text = body.trim();

  const insert = (value: string) =>
    setBody((current) => (current.trim() ? `${current.trimEnd()}\n\n${value}` : value));

  const send = async () => {
    if (!text || pending) return;
    const saved = await run(
      () =>
        apiClient.api.admin.tickets({ id: ticket.id }).messages.post({
          body: text,
          internal,
          ...(files.length > 0 ? { attachments: files } : {}),
        }),
      {
        success: internal ? copy.noted : copy.sent,
        refresh: !(after && !internal),
      },
    );
    if (!saved) return;
    setBody("");
    attachments.clear();
    if (after && !internal && after !== ticket.status) {
      await run(() => apiClient.api.admin.tickets({ id: ticket.id }).patch({ status: after }));
    }
    setAfter("");
  };

  const onDragOver = (event: DragEvent<HTMLElement>) => {
    if (!carriesFiles(event)) return;
    event.preventDefault();
    setDragging(true);
  };

  const onDragLeave = (event: DragEvent<HTMLElement>) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDragging(false);
  };

  const onDrop = (event: DragEvent<HTMLElement>) => {
    if (!carriesFiles(event)) return;
    event.preventDefault();
    setDragging(false);
    if (!pending) attachments.add([...event.dataTransfer.files]);
  };

  return (
    <section
      aria-labelledby={`${id}-title`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        "relative flex flex-col gap-3 card p-4 shadow-card transition-colors sm:p-5",
        internal && "border-warning/40 bg-warning-soft/40",
        dragging && "border-primary ring-3 ring-primary/15",
      )}
    >
      {dragging && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-2 z-10 grid place-items-center rounded-field border-2 border-dashed border-primary bg-primary-soft/85"
        >
          <span className="flex items-center gap-2 text-sm font-extrabold text-primary">
            <Paperclip className="size-4.5" />
            {copy.dropFiles}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2
          id={`${id}-title`}
          className="flex items-center gap-2 text-lead font-extrabold text-ink"
        >
          <span className={cn("icon-tile size-8", internal && "bg-warning-soft text-warning")}>
            {internal ? (
              <Lock className="size-4" aria-hidden />
            ) : (
              <MessageSquareReply className="size-4" aria-hidden />
            )}
          </span>
          {internal ? copy.note : copy.reply}
        </h2>
        <SegmentedControl
          size="sm"
          options={[
            { value: "reply", label: copy.reply },
            { value: "note", label: copy.note },
          ]}
          value={mode}
          onChange={setMode}
          label={copy.reply}
        />
      </div>
      {!internal && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-caption font-bold text-muted">
            <Sparkles className="size-3.5" aria-hidden />
            {copy.canned}:
          </span>
          {adminContent.tickets.cannedReplies.map((reply) => (
            <button
              key={reply.title}
              type="button"
              onClick={() => insert(reply.body)}
              className="inline-flex h-7 items-center rounded-full border border-line bg-raised px-3 text-caption font-bold text-ink-soft transition-colors hover:border-primary/50 hover:text-primary"
            >
              {reply.title}
            </button>
          ))}
        </div>
      )}
      <label htmlFor={`${id}-body`} className="sr-only">
        {internal ? copy.note : copy.reply}
      </label>
      <textarea
        id={`${id}-body`}
        value={body}
        maxLength={MAX}
        rows={5}
        onChange={(event) => setBody(event.target.value)}
        onPaste={(event) => {
          const pasted = [...event.clipboardData.files];
          if (pasted.length === 0) return;
          event.preventDefault();
          attachments.add(pasted);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            void send();
          }
        }}
        placeholder={internal ? copy.notePlaceholder : copy.replyPlaceholder}
        className="min-h-32 w-full resize-y rounded-field border border-line-strong bg-raised px-3.5 py-3 text-sm leading-7 text-ink outline-none focus:border-primary focus:ring-3 focus:ring-primary/15"
      />
      <ReplyAttachments attachments={attachments} disabled={pending} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="flex-1 text-caption text-muted">
          {internal ? copy.noteHint : copy.shortcut} · {faNumber(body.length)}/{faNumber(MAX)}
        </p>
        {!internal && open && (
          <label className="flex items-center gap-2 text-caption font-bold text-muted">
            {copy.statusAfter}
            <Select
              options={afterOptions.map((value) => ({ value, label: statuses.ticket[value] }))}
              placeholder={copy.keepStatus}
              value={after}
              onChange={(event) => setAfter(isStatus(event.target.value) ? event.target.value : "")}
              className="h-9 w-44 text-xs"
            />
          </label>
        )}
        <Button
          onClick={() => void send()}
          disabled={!text || pending}
          variant={internal ? "dark" : "primary"}
        >
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
          ) : internal ? (
            <Lock className="size-4" aria-hidden />
          ) : (
            <Send className="size-4 -scale-x-100" aria-hidden />
          )}
          {internal ? copy.saveNote : copy.send}
        </Button>
      </div>
    </section>
  );
}
