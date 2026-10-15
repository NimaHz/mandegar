import "server-only";

import { and, asc, count, desc, eq, gte, notInArray, sum } from "drizzle-orm";

import { hasPermission } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import {
  auditLogs,
  brands,
  categories,
  contactMessages,
  media,
  products,
  tickets,
  users,
  warrantyCodes,
} from "@/server/db/schema";
import type {
  AdminAuditLog,
  AdminAuditQuery,
  AdminListQuery,
  AdminOption,
  AdminUser,
  DashboardStats,
} from "@/types/admin";

import { readSettings } from "../db/content";
import { iso, isoOrNull, paginate, searchColumns } from "./shared";
import { breachingTickets, closedTicketStatuses, ticketsAdmin } from "./tickets";

const toUser = ({
  passwordHash: _hash,
  totpSecret: _secret,
  ...row
}: typeof users.$inferSelect): AdminUser => ({
  ...row,
  lastLoginAt: isoOrNull(row.lastLoginAt),
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const usersAdmin = {
  list: async (query: Partial<AdminListQuery> = {}) => {
    const where = searchColumns(query.q, { text: [users.name, users.email] });
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(users).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(users)
          .where(where)
          .orderBy(asc(users.name))
          .limit(limit)
          .offset(offset),
      (rows) => rows.map(toUser),
    );
  },
  get: async (id: string) => {
    const [row] = await getDb().select().from(users).where(eq(users.id, id));
    return row ? toUser(row) : null;
  },
  assignees: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select()
      .from(users)
      .where(eq(users.active, true))
      .orderBy(asc(users.name));
    return rows
      .filter((row) => hasPermission(row.role, "tickets:write"))
      .map((row) => ({
        id: row.id,
        slug: null,
        label: { fa: row.name, en: row.name },
        hint: row.role,
      }));
  },
};

export const auditAdmin = {
  list: async (query: Partial<AdminAuditQuery> = {}) => {
    const where = and(
      searchColumns(query.q, { text: [auditLogs.action, auditLogs.entityId] }),
      query.entity ? eq(auditLogs.entity, query.entity) : undefined,
      query.actorId ? eq(auditLogs.actorId, query.actorId) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(auditLogs).where(where),
      (limit, offset) =>
        getDb().query.auditLogs.findMany({
          where: () => where,
          orderBy: () => [desc(auditLogs.id)],
          limit,
          offset,
          with: { actor: { columns: { id: true, name: true } } },
        }),
      (rows) =>
        rows.map((row): AdminAuditLog => ({
          id: String(row.id),
          actor: row.actor,
          action: row.action,
          entity: row.entity,
          entityId: row.entityId,
          diff: row.diff ?? null,
          ip: row.ip,
          userAgent: row.userAgent,
          createdAt: iso(row.createdAt),
        })),
    );
  },
};

const tally = <TKey extends string>(rows: { key: TKey; total: number }[], keys: readonly TKey[]) =>
  Object.fromEntries(
    keys.map((key) => [key, rows.find((row) => row.key === key)?.total ?? 0]),
  ) as Record<TKey, number>;

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

export const statsAdmin = {
  get: async (): Promise<DashboardStats> => {
    const db = getDb();
    const openTickets = notInArray(tickets.status, closedTicketStatuses);
    const [
      productRows,
      [categoryCount],
      [brandCount],
      [mediaRow],
      [open],
      [urgent],
      [breaching],
      [today],
      [unread],
      codeRows,
      recentTickets,
    ] = await Promise.all([
      db.select({ key: products.status, total: count() }).from(products).groupBy(products.status),
      db.select({ total: count() }).from(categories),
      db.select({ total: count() }).from(brands),
      db.select({ total: count(), bytes: sum(media.size) }).from(media),
      db.select({ total: count() }).from(tickets).where(openTickets),
      db
        .select({ total: count() })
        .from(tickets)
        .where(and(openTickets, eq(tickets.priority, "urgent"))),
      db.select({ total: count() }).from(tickets).where(breachingTickets()),
      db.select({ total: count() }).from(tickets).where(gte(tickets.createdAt, startOfToday())),
      db.select({ total: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
      db
        .select({ key: warrantyCodes.status, total: count() })
        .from(warrantyCodes)
        .groupBy(warrantyCodes.status),
      ticketsAdmin.recent(5),
    ]);
    return {
      products: tally(productRows, ["draft", "published", "archived"]),
      categories: categoryCount?.total ?? 0,
      brands: brandCount?.total ?? 0,
      media: { count: mediaRow?.total ?? 0, bytes: Number(mediaRow?.bytes ?? 0) },
      tickets: {
        open: open?.total ?? 0,
        urgent: urgent?.total ?? 0,
        breaching: breaching?.total ?? 0,
        today: today?.total ?? 0,
      },
      messages: { unread: unread?.total ?? 0 },
      warrantyCodes: tally(codeRows, ["active", "revoked", "recalled"]),
      recentTickets,
    };
  },
};

export const settingsAdmin = {
  get: readSettings,
};
