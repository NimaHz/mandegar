"use client";

import { LoaderCircle, SlidersHorizontal } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { AdminOption, AdminTicket } from "@/types/admin";
import {
  isTicketStatus,
  ticketPriorities,
  type TicketPriority,
  ticketStatuses,
} from "@/types/support";

import { adminContent } from "../../content";
import { toOptions } from "../../lib/options";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { PanelCard } from "../panel-card";

const copy = adminContent.tickets.detail;
const { statuses } = adminContent;

const isPriority = (value: string): value is TicketPriority =>
  ticketPriorities.some((priority) => priority === value);

export function TicketControls({
  ticket,
  assignees,
}: {
  ticket: AdminTicket;
  assignees: AdminOption[];
}) {
  const { run, pending } = useAdminMutation();
  const [status, setStatus] = useState(ticket.status);
  const [priority, setPriority] = useState(ticket.priority);
  const [assigneeId, setAssigneeId] = useState(ticket.assignee?.id ?? "");
  const changed =
    status !== ticket.status ||
    priority !== ticket.priority ||
    assigneeId !== (ticket.assignee?.id ?? "");

  const apply = () =>
    void run(
      () =>
        apiClient.api.admin.tickets({ id: ticket.id }).patch({
          ...(status !== ticket.status ? { status } : {}),
          ...(priority !== ticket.priority ? { priority } : {}),
          ...(assigneeId !== (ticket.assignee?.id ?? "") ? { assigneeId: assigneeId || null } : {}),
        }),
      { success: copy.updated },
    );

  const field = "flex flex-col gap-1.5 text-label font-bold text-ink";

  return (
    <PanelCard title={copy.controls} icon={SlidersHorizontal}>
      <label className={field}>
        {copy.status}
        <Select
          options={ticketStatuses.map((value) => ({ value, label: statuses.ticket[value] }))}
          value={status}
          onChange={(event) => {
            if (isTicketStatus(event.target.value)) setStatus(event.target.value);
          }}
        />
      </label>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
        <label className={field}>
          {copy.priority}
          <Select
            options={ticketPriorities.map((value) => ({ value, label: statuses.priority[value] }))}
            value={priority}
            onChange={(event) => {
              if (isPriority(event.target.value)) setPriority(event.target.value);
            }}
          />
        </label>
        <label className={field}>
          {copy.assignee}
          <Select
            options={toOptions(assignees)}
            placeholder={copy.unassigned}
            value={assigneeId}
            onChange={(event) => setAssigneeId(event.target.value)}
          />
        </label>
      </div>
      <Button onClick={apply} disabled={!changed || pending} variant={changed ? "primary" : "soft"}>
        {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
        {changed ? copy.apply : copy.noChanges}
      </Button>
    </PanelCard>
  );
}
