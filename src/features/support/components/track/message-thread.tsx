import { FileText, ImageIcon } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import type { PublicTicketMessage, PublicTicketPost, TicketStatus } from "@/types/support";

import type { TrackContent } from "../../content";
import { statusMeta, toneClasses } from "../../ticket-status";

interface MessageThreadProps {
  locale: Locale;
  messages: PublicTicketMessage[];
  copy: TrackContent["thread"];
  statuses: Record<TicketStatus, { label: string }>;
}

function Attachments({ items, label }: { items: PublicTicketPost["attachments"]; label: string }) {
  if (items.length === 0) return null;
  return (
    <ul aria-label={label} className="mt-2.5 flex flex-wrap gap-1.5">
      {items.map((item) => {
        const Icon = item.mime.startsWith("image/") ? ImageIcon : FileText;
        return (
          <li key={item.href}>
            <a
              href={item.href}
              target="_blank"
              rel="noopener"
              className="inline-flex max-w-56 items-center gap-1.5 rounded-control bg-black/5 px-2.5 py-1.5 text-xs font-semibold underline-offset-4 transition-colors hover:underline dark:bg-white/10"
            >
              <Icon className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate" dir="auto">
                {item.name}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function MessageThread({ locale, messages, copy, statuses }: MessageThreadProps) {
  return (
    <ol className="flex flex-col gap-4">
      {messages.map((message) => {
        const time = (
          <time dateTime={message.createdAt} className="text-caption text-muted">
            {formatDateTime(locale, message.createdAt)}
          </time>
        );
        if (message.author === "system") {
          const meta = statusMeta[message.status];
          const StatusIcon = meta.icon;
          return (
            <li key={message.id} className="flex flex-col items-center gap-1 text-center">
              <span className="inline-flex max-w-md items-start gap-2 rounded-full bg-chip px-4 py-1.5 text-xs leading-6 font-semibold text-ink-soft">
                <StatusIcon
                  className={cn("mt-1 size-3.5 shrink-0", toneClasses[meta.tone].text)}
                  aria-hidden
                />
                <span>
                  <span className="sr-only">{copy.system}: </span>
                  {fill(copy.statusChanged, { status: statuses[message.status].label })}
                </span>
              </span>
              {time}
            </li>
          );
        }
        const customer = message.author === "customer";
        return (
          <li
            key={message.id}
            className={cn(
              "flex max-w-[88%] flex-col gap-1.5 sm:max-w-[78%]",
              customer ? "items-end self-end" : "items-start self-start",
            )}
          >
            <span className="inline-flex items-center gap-2 text-caption font-bold text-muted">
              {!customer && <LogoMark className="size-4.5" />}
              {customer ? copy.customer : copy.staff}
            </span>
            <div
              className={cn(
                "rounded-card px-4 py-3 text-sm leading-7 whitespace-pre-line",
                customer
                  ? "rounded-se-md bg-primary text-on-primary"
                  : "rounded-ss-md border border-line bg-surface text-ink",
              )}
            >
              <p dir="auto">{message.body}</p>
              <Attachments items={message.attachments} label={copy.attachments} />
            </div>
            {time}
          </li>
        );
      })}
    </ol>
  );
}
