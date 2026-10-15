import { CircleCheck, Clock, TriangleAlert } from "lucide-react";

import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import type { AdminTicketListItem } from "@/types/admin";
import type { TicketPriority, TicketStatus } from "@/types/support";

import { openTicketStatuses, priorityTone, ticketStatusTone } from "../../config";
import { adminContent } from "../../content";
import { durationLabel } from "../../lib/format";
import { StatusBadge } from "../data/status-badge";

const { statuses } = adminContent;
const sla = adminContent.tickets.sla;

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <StatusBadge tone={ticketStatusTone[status]} label={statuses.ticket[status]} />;
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return (
    <StatusBadge
      tone={priorityTone[priority]}
      label={statuses.priority[priority]}
      dot={priority === "urgent"}
      className={cn(priority === "urgent" && "animate-none")}
    />
  );
}

type SlaTicket = Pick<
  AdminTicketListItem,
  "status" | "firstResponseDue" | "resolutionDue" | "firstRespondedAt" | "breaching"
>;

export function SlaIndicator({
  ticket,
  now,
  compact,
}: {
  ticket: SlaTicket;
  now: number;
  compact?: boolean;
}) {
  const open = openTicketStatuses.includes(ticket.status);
  if (!open)
    return (
      <span className="inline-flex items-center gap-1 text-caption font-bold text-muted">
        <CircleCheck className="size-3.5" aria-hidden />
        {sla.done}
      </span>
    );
  const responding = !ticket.firstRespondedAt;
  const due = new Date(responding ? ticket.firstResponseDue : ticket.resolutionDue).getTime();
  const delta = due - now;
  const overdue = delta < 0;
  const time = durationLabel(delta, sla);
  const label = fill(overdue ? sla.overdue : sla.dueIn, { time });
  const Icon = overdue ? TriangleAlert : Clock;
  const soon = !overdue && delta < 4 * 3_600_000;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-caption font-bold whitespace-nowrap",
        overdue ? "text-danger" : soon ? "text-warning" : "text-body",
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {!compact && (
        <span className="text-muted">{responding ? sla.firstResponse : sla.resolution}:</span>
      )}
      {label}
    </span>
  );
}
