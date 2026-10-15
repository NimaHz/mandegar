import { relations } from "drizzle-orm";
import { boolean, index, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { userRoles } from "@/types/admin";

import { id, timestamps, timestamptz } from "./columns";

export const userRole = pgEnum("user_role", userRoles);

export const users = pgTable("users", {
  id: id(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  role: userRole().notNull(),
  totpSecret: text(),
  totpEnabled: boolean().notNull().default(false),
  active: boolean().notNull().default(true),
  mustChangePassword: boolean().notNull().default(false),
  lastLoginAt: timestamptz(),
  ...timestamps,
});

export const sessions = pgTable(
  "sessions",
  {
    id: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamptz().notNull(),
    lastSeenAt: timestamptz().notNull().defaultNow(),
    ip: text(),
    userAgent: text(),
    createdAt: timestamptz().notNull().defaultNow(),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_expires_idx").on(table.expiresAt),
  ],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
