import { relations } from "drizzle-orm";
import { bigserial, index, integer, jsonb, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import type { JsonValue, SettingKey, SettingsValues } from "@/types/admin";
import { mediaKinds, notificationStatuses } from "@/types/admin";

import { users } from "./auth";
import { id, localized, timestamps, timestamptz } from "./columns";

export const mediaKind = pgEnum("media_kind", mediaKinds);

export const notificationStatus = pgEnum("notification_status", notificationStatuses);

export const media = pgTable(
  "media",
  {
    id: id(),
    kind: mediaKind().notNull(),
    storageKey: text().notNull().unique(),
    mime: text().notNull(),
    size: integer().notNull(),
    width: integer(),
    height: integer(),
    durationSec: integer(),
    sha256: text().notNull().unique(),
    alt: localized().default({ fa: "", en: "" }),
    originalName: text(),
    uploadedBy: uuid().references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [index("media_kind_created_idx").on(table.kind, table.createdAt)],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    actorId: uuid().references(() => users.id, { onDelete: "set null" }),
    action: text().notNull(),
    entity: text().notNull(),
    entityId: text(),
    diff: jsonb().$type<JsonValue>(),
    ip: text(),
    userAgent: text(),
    createdAt: timestamptz().notNull().defaultNow(),
  },
  (table) => [
    index("audit_logs_created_idx").on(table.createdAt),
    index("audit_logs_entity_idx").on(table.entity, table.entityId),
    index("audit_logs_actor_idx").on(table.actorId),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  key: text().primaryKey(),
  windowStart: timestamptz().notNull(),
  count: integer().notNull(),
});

export const settings = pgTable("settings", {
  key: text().$type<SettingKey>().primaryKey(),
  value: jsonb().$type<SettingsValues[SettingKey]>().notNull(),
  ...timestamps,
});

export const notificationOutbox = pgTable(
  "notification_outbox",
  {
    id: id(),
    channel: text().notNull(),
    driver: text().notNull(),
    recipient: text().notNull(),
    template: text().notNull(),
    payload: jsonb().$type<JsonValue>().notNull(),
    status: notificationStatus().notNull(),
    error: text(),
    createdAt: timestamptz().notNull().defaultNow(),
  },
  (table) => [index("notification_outbox_created_idx").on(table.createdAt)],
);

export const mediaRelations = relations(media, ({ one }) => ({
  uploader: one(users, { fields: [media.uploadedBy], references: [users.id] }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, { fields: [auditLogs.actorId], references: [users.id] }),
}));
