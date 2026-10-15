import { relations, sql } from "drizzle-orm";
import { boolean, date, index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { contactStatuses, messageAuthorTypes } from "@/types/admin";
import { contactDepartments, ticketPriorities, ticketStatuses, ticketTypes } from "@/types/support";

import { users } from "./auth";
import { products } from "./catalog";
import { id, timestamps, timestamptz } from "./columns";
import { warrantyCodes } from "./warranty";

export const ticketType = pgEnum("ticket_type", ticketTypes);
export const ticketStatus = pgEnum("ticket_status", ticketStatuses);
export const ticketPriority = pgEnum("ticket_priority", ticketPriorities);
export const messageAuthorType = pgEnum("message_author_type", messageAuthorTypes);
export const contactDepartment = pgEnum("contact_department", contactDepartments);
export const contactStatus = pgEnum("contact_status", contactStatuses);

export const tickets = pgTable(
  "tickets",
  {
    id: id(),
    trackingCode: text().notNull().unique(),
    accessTokenHash: text().notNull().unique(),
    type: ticketType().notNull(),
    status: ticketStatus().notNull().default("new"),
    priority: ticketPriority().notNull().default("normal"),
    name: text().notNull(),
    phone: text().notNull(),
    email: text(),
    province: text().notNull(),
    city: text().notNull(),
    address: text().notNull(),
    warrantyCodeId: uuid().references(() => warrantyCodes.id, { onDelete: "set null" }),
    productId: uuid().references(() => products.id, { onDelete: "set null" }),
    purchaseDate: date({ mode: "string" }),
    subject: text().notNull(),
    description: text().notNull(),
    assigneeId: uuid().references(() => users.id, { onDelete: "set null" }),
    firstResponseDue: timestamptz().notNull(),
    resolutionDue: timestamptz().notNull(),
    firstRespondedAt: timestamptz(),
    resolvedAt: timestamptz(),
    closedAt: timestamptz(),
    ...timestamps,
  },
  (table) => [
    index("tickets_status_idx").on(table.status, table.priority),
    index("tickets_phone_idx").on(table.phone),
    index("tickets_assignee_idx").on(table.assigneeId),
    index("tickets_created_idx").on(table.createdAt),
  ],
);

export const ticketMessages = pgTable(
  "ticket_messages",
  {
    id: id(),
    ticketId: uuid()
      .notNull()
      .references(() => tickets.id, { onDelete: "cascade" }),
    authorType: messageAuthorType().notNull(),
    authorId: uuid().references(() => users.id, { onDelete: "set null" }),
    body: text().notNull(),
    internal: boolean().notNull().default(false),
    attachmentMediaIds: uuid()
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    ...timestamps,
  },
  (table) => [index("ticket_messages_ticket_idx").on(table.ticketId, table.createdAt)],
);

export const contactMessages = pgTable(
  "contact_messages",
  {
    id: id(),
    department: contactDepartment().notNull(),
    name: text().notNull(),
    phone: text().notNull(),
    email: text(),
    subject: text().notNull(),
    body: text().notNull(),
    status: contactStatus().notNull().default("new"),
    ipHash: text().notNull(),
    ...timestamps,
  },
  (table) => [index("contact_messages_status_idx").on(table.status, table.createdAt)],
);

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  product: one(products, { fields: [tickets.productId], references: [products.id] }),
  warrantyCode: one(warrantyCodes, {
    fields: [tickets.warrantyCodeId],
    references: [warrantyCodes.id],
  }),
  assignee: one(users, { fields: [tickets.assigneeId], references: [users.id] }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, { fields: [ticketMessages.ticketId], references: [tickets.id] }),
  author: one(users, { fields: [ticketMessages.authorId], references: [users.id] }),
}));
