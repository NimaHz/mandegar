import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNull,
  lt,
  notInArray,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import { formatTrackingCode } from "@/lib/tracking-code";
import { formatWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import { ticketMessages, tickets } from "@/server/db/schema";
import { staffAttachmentHref } from "@/server/modules/tickets/attachments";
import {
  type AdminAttachment,
  type AdminSort,
  adminSorts,
  type AdminTicket,
  type AdminTicketListItem,
  type AdminTicketsQuery,
} from "@/types/admin";
import type { TicketStatus } from "@/types/support";

import { mediaIndex, orderByIds } from "../db/mappers";
import { iso, isoOrNull } from "../db/mappers";
import { collated, paginate, searchColumns, sortedBy, toMediaRef } from "./shared";

export const closedTicketStatuses: TicketStatus[] = ["resolved", "closed", "rejected"];

const isOpen = notInArray(tickets.status, closedTicketStatuses);

export const breachingTickets = () => {
  const now = new Date();
  return and(
    isOpen,
    or(
      and(isNull(tickets.firstRespondedAt), lt(tickets.firstResponseDue, now)),
      and(isNull(tickets.resolvedAt), lt(tickets.resolutionDue, now)),
    ),
  );
};

const priorityRank = sql`case ${tickets.priority} when 'urgent' then 0 when 'high' then 1 when 'normal' then 2 else 3 end`;

const nextDue = sql`case when ${tickets.firstRespondedAt} is null then ${tickets.firstResponseDue} else ${tickets.resolutionDue} end`;

const orders: Record<AdminSort<"tickets">, SQL[]> = {
  "priority-desc": [asc(priorityRank), desc(tickets.createdAt)],
  "due-asc": [asc(inArray(tickets.status, closedTicketStatuses)), asc(nextDue)],
  "updated-desc": [desc(tickets.updatedAt)],
  "created-desc": [desc(tickets.createdAt)],
  "name-asc": [asc(collated(tickets.name)), desc(tickets.createdAt)],
};

const whereOf = (query: Partial<AdminTicketsQuery>) =>
  and(
    searchColumns(query.q, {
      text: [tickets.trackingCode, tickets.name, tickets.phone, tickets.subject, tickets.city],
    }),
    query.type ? eq(tickets.type, query.type) : undefined,
    query.status ? eq(tickets.status, query.status) : undefined,
    query.priority ? eq(tickets.priority, query.priority) : undefined,
    query.assigneeId ? eq(tickets.assigneeId, query.assigneeId) : undefined,
    query.open ? isOpen : undefined,
    query.breaching ? breachingTickets() : undefined,
  );

const findTickets = (ids: string[]) =>
  getDb().query.tickets.findMany({
    where: (table) => inArray(table.id, ids),
    with: {
      assignee: { columns: { id: true, name: true } },
      product: { columns: { id: true, slug: true, name: true, modelCode: true } },
      warrantyCode: true,
    },
  });

type TicketRow = Awaited<ReturnType<typeof findTickets>>[number];

const isBreaching = (row: TicketRow, now: number) =>
  !closedTicketStatuses.includes(row.status) &&
  ((!row.firstRespondedAt && row.firstResponseDue.getTime() < now) ||
    (!row.resolvedAt && row.resolutionDue.getTime() < now));

const toListItem = (row: TicketRow, now = Date.now()): AdminTicketListItem => ({
  id: row.id,
  trackingCode: row.trackingCode,
  formattedTrackingCode: formatTrackingCode(row.trackingCode),
  type: row.type,
  status: row.status,
  priority: row.priority,
  name: row.name,
  phone: row.phone,
  subject: row.subject,
  province: row.province,
  city: row.city,
  assignee: row.assignee,
  product: row.product,
  firstResponseDue: iso(row.firstResponseDue),
  resolutionDue: iso(row.resolutionDue),
  firstRespondedAt: isoOrNull(row.firstRespondedAt),
  breaching: isBreaching(row, now),
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

const hydrate = async (ids: string[]) =>
  ids.length ? orderByIds(ids, await findTickets(ids)).map((row) => toListItem(row)) : [];

const ticketIds = (query: Partial<AdminTicketsQuery>, limit: number, offset: number) =>
  getDb()
    .select({ id: tickets.id })
    .from(tickets)
    .where(whereOf(query))
    .orderBy(...sortedBy(orders, query.sort ?? adminSorts.tickets[0], tickets.id))
    .limit(limit)
    .offset(offset);

const messagesOf = async (ticketId: string) => {
  const rows = await getDb().query.ticketMessages.findMany({
    where: (table, { eq: equals }) => equals(table.ticketId, ticketId),
    orderBy: () => [asc(ticketMessages.createdAt)],
    with: { author: { columns: { id: true, name: true } } },
  });
  const files = await mediaIndex(rows.flatMap((row) => row.attachmentMediaIds));
  return rows.map((row) => ({
    id: row.id,
    authorType: row.authorType,
    author: row.author,
    body: row.body,
    internal: row.internal,
    attachments: row.attachmentMediaIds.flatMap((id): AdminAttachment[] => {
      const file = files.get(id);
      return file
        ? [
            {
              ...toMediaRef(file),
              url: staffAttachmentHref(ticketId, id),
              name: file.originalName ?? file.storageKey.split("/").at(-1) ?? file.storageKey,
              size: file.size,
            },
          ]
        : [];
    }),
    createdAt: iso(row.createdAt),
  }));
};

export const ticketsAdmin = {
  list: (query: Partial<AdminTicketsQuery> = {}) =>
    paginate(
      query.page,
      () => getDb().select({ total: count() }).from(tickets).where(whereOf(query)),
      (limit, offset) => ticketIds(query, limit, offset),
      (rows) => hydrate(rows.map((row) => row.id)),
    ),
  recent: async (limit: number) =>
    hydrate((await ticketIds({ open: true }, limit, 0)).map((row) => row.id)),
  get: async (id: string): Promise<AdminTicket | null> => {
    const [row] = await findTickets([id]);
    if (!row) return null;
    return {
      ...toListItem(row),
      email: row.email,
      address: row.address,
      purchaseDate: row.purchaseDate,
      description: row.description,
      warrantyCode: row.warrantyCode
        ? {
            id: row.warrantyCode.id,
            code: row.warrantyCode.code,
            formatted: formatWarrantyCode(row.warrantyCode.code),
            status: row.warrantyCode.status,
            productionYear: row.warrantyCode.productionYear,
          }
        : null,
      resolvedAt: isoOrNull(row.resolvedAt),
      closedAt: isoOrNull(row.closedAt),
      messages: await messagesOf(row.id),
    };
  },
};
