import "server-only";

import { and, asc, count, desc, eq, gte, notInArray, type SQL, sum } from "drizzle-orm";

import { startOfTehranDay } from "@/lib/dates";
import { hasPermission } from "@/server/auth/permissions";
import { getDb } from "@/server/db/client";
import {
  auditLogs,
  brands,
  categories,
  contactMessages,
  media,
  products,
  settings,
  tickets,
  users,
  warrantyCodes,
} from "@/server/db/schema";
import type {
  AdminAuditLog,
  AdminAuditQuery,
  AdminCounts,
  AdminListQuery,
  AdminOption,
  AdminUser,
  DashboardStats,
  Permission,
  SettingKey,
  SettingVersions,
} from "@/types/admin";

import { readSettings } from "../db/content";
import { iso, isoOrNull } from "../db/mappers";
import { collated, paginate, searchColumns } from "./shared";
import { breachingTickets, closedTicketStatuses, ticketsAdmin } from "./tickets";

const byName = [asc(collated(users.name)), asc(users.id)];

const toOption = (row: { id: string; name: string; role: AdminUser["role"] }): AdminOption => ({
  id: row.id,
  slug: null,
  label: { fa: row.name, en: row.name },
  hint: row.role,
});

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
          .orderBy(...byName)
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
      .orderBy(...byName);
    return rows.filter((row) => hasPermission(row.role, "tickets:write")).map(toOption);
  },
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select({ id: users.id, name: users.name, role: users.role })
      .from(users)
      .orderBy(...byName);
    return rows.map(toOption);
  },
};

const findAuditLogs = (where: SQL | undefined, limit: number, offset: number) =>
  getDb().query.auditLogs.findMany({
    where: () => where,
    orderBy: () => [desc(auditLogs.id)],
    limit,
    offset,
    with: { actor: { columns: { id: true, name: true } } },
  });

const toAuditLog = (row: Awaited<ReturnType<typeof findAuditLogs>>[number]): AdminAuditLog => ({
  id: String(row.id),
  actor: row.actor,
  action: row.action,
  entity: row.entity,
  entityId: row.entityId,
  diff: row.diff ?? null,
  ip: row.ip,
  userAgent: row.userAgent,
  createdAt: iso(row.createdAt),
});

export const auditAdmin = {
  list: async (query: Partial<AdminAuditQuery> = {}) => {
    const where = and(
      searchColumns(query.q, { text: [auditLogs.action, auditLogs.entityId] }),
      query.entity ? eq(auditLogs.entity, query.entity) : undefined,
      query.action ? eq(auditLogs.action, query.action) : undefined,
      query.actorId ? eq(auditLogs.actorId, query.actorId) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(auditLogs).where(where),
      (limit, offset) => findAuditLogs(where, limit, offset),
      (rows) => rows.map(toAuditLog),
    );
  },
  recent: async (limit: number) => (await findAuditLogs(undefined, limit, 0)).map(toAuditLog),
};

const tally = <TKey extends string>(rows: { key: TKey; total: number }[], keys: readonly TKey[]) =>
  Object.fromEntries(
    keys.map((key) => [key, rows.find((row) => row.key === key)?.total ?? 0]),
  ) as Record<TKey, number>;

export const statsAdmin = {
  counts: async (): Promise<AdminCounts> => {
    const db = getDb();
    const [[open], [unread]] = await Promise.all([
      db
        .select({ total: count() })
        .from(tickets)
        .where(notInArray(tickets.status, closedTicketStatuses)),
      db.select({ total: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
    ]);
    return { openTickets: open?.total ?? 0, unreadMessages: unread?.total ?? 0 };
  },
  get: async (permissions: readonly Permission[]): Promise<DashboardStats> => {
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
      db
        .select({ total: count(), bytes: sum(media.size) })
        .from(media)
        .where(eq(media.scope, "library")),
      db.select({ total: count() }).from(tickets).where(openTickets),
      db
        .select({ total: count() })
        .from(tickets)
        .where(and(openTickets, eq(tickets.priority, "urgent"))),
      db.select({ total: count() }).from(tickets).where(breachingTickets()),
      db.select({ total: count() }).from(tickets).where(gte(tickets.createdAt, startOfTehranDay())),
      db.select({ total: count() }).from(contactMessages).where(eq(contactMessages.status, "new")),
      db
        .select({ key: warrantyCodes.status, total: count() })
        .from(warrantyCodes)
        .groupBy(warrantyCodes.status),
      permissions.includes("tickets:read") ? ticketsAdmin.recent(5) : [],
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

const settingVersions = async (): Promise<SettingVersions> => {
  const rows = await getDb()
    .select({ key: settings.key, updatedAt: settings.updatedAt })
    .from(settings);
  const versionOf = (key: SettingKey) =>
    isoOrNull(rows.find((row) => row.key === key)?.updatedAt ?? null);
  return {
    contact: versionOf("contact"),
    seo: versionOf("seo"),
    stats: versionOf("stats"),
    company: versionOf("company"),
  };
};

export const settingsAdmin = {
  get: readSettings,
  versions: settingVersions,
};
