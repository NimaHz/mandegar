"use client";

import { ChevronLeft, Inbox, UserRound } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { adminRoutes } from "@/lib/routes";
import type { AdminOption, AdminTicketListItem } from "@/types/admin";
import type { Paginated } from "@/types/common";

import { adminContent } from "../../content";
import { enumOptions, toOptions } from "../../lib/options";
import { type Column, DataTable } from "../data/data-table";
import { ListEmpty, ListFrame } from "../data/list-frame";
import { ListPagination } from "../data/list-pagination";
import { ListToolbar } from "../data/list-toolbar";
import { IconLink } from "../data/row-actions";
import { CodeText } from "../data/thumb-cell";
import { PanelHeading } from "../panel-heading";
import { PriorityBadge, SlaIndicator, TicketStatusBadge } from "./ticket-badges";

const copy = adminContent.tickets;
const { statuses, common } = adminContent;

interface TicketsListProps {
  result: Paginated<AdminTicketListItem>;
  assignees: AdminOption[];
  filtered: boolean;
  now: number;
}

export function TicketsList({ result, assignees, filtered, now }: TicketsListProps) {
  const columns: Column<AdminTicketListItem>[] = [
    {
      key: "ticket",
      header: copy.columns.ticket,
      mobile: "primary",
      className: "min-w-64",
      cell: (ticket) => (
        <Link
          href={adminRoutes.ticket(ticket.id) as Route}
          className="group flex min-w-0 flex-col gap-1"
        >
          <span className="flex items-center gap-2 text-caption text-muted">
            <CodeText className="font-bold">{ticket.formattedTrackingCode}</CodeText>
            <span aria-hidden>·</span>
            {statuses.ticketType[ticket.type]}
          </span>
          <span className="line-clamp-1 text-sm font-extrabold text-ink transition-colors group-hover:text-primary">
            {ticket.subject}
          </span>
        </Link>
      ),
    },
    {
      key: "customer",
      header: copy.columns.customer,
      cell: (ticket) => (
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate font-bold text-ink">{ticket.name}</span>
          <bdi dir="ltr" className="text-start font-code text-caption text-muted">
            {ticket.phone}
          </bdi>
        </span>
      ),
    },
    {
      key: "state",
      header: common.status,
      cell: (ticket) => (
        <span className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </span>
      ),
    },
    {
      key: "sla",
      header: copy.columns.sla,
      cell: (ticket) => <SlaIndicator ticket={ticket} now={now} compact />,
    },
    {
      key: "assignee",
      header: copy.columns.assignee,
      cell: (ticket) =>
        ticket.assignee ? (
          <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
            <UserRound className="size-3.5 text-muted" aria-hidden />
            {ticket.assignee.name}
          </span>
        ) : (
          <span className="text-muted">{copy.unassigned}</span>
        ),
    },
  ];

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
            {
              key: "scope",
              label: copy.filters.scope,
              allLabel: copy.scopes.open,
              options: [
                { value: "breaching", label: copy.scopes.breaching },
                { value: "all", label: copy.scopes.all },
              ],
            },
            { key: "status", label: copy.filters.status, options: enumOptions(statuses.ticket) },
            { key: "type", label: copy.filters.type, options: enumOptions(statuses.ticketType) },
            {
              key: "priority",
              label: copy.filters.priority,
              options: enumOptions(statuses.priority),
            },
            { key: "assigneeId", label: copy.filters.assignee, options: toOptions(assignees) },
          ]}
        />
      }
    >
      {result.items.length === 0 ? (
        <ListEmpty
          filtered={filtered}
          icon={Inbox}
          title={copy.emptyTitle}
          description={copy.emptyDescription}
        />
      ) : (
        <>
          <DataTable
            caption={copy.title}
            rows={result.items}
            columns={columns}
            rowKey={(ticket) => ticket.id}
            rowClassName={(ticket) => (ticket.breaching ? "bg-danger-soft/35" : undefined)}
            actions={(ticket) => (
              <IconLink
                href={adminRoutes.ticket(ticket.id) as Route}
                label={`${common.open} ${ticket.formattedTrackingCode}`}
                icon={ChevronLeft}
              />
            )}
          />
          <ListPagination page={result.page} pageCount={result.pageCount} total={result.total} />
        </>
      )}
    </ListFrame>
  );
}
