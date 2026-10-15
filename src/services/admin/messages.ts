import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { contactMessages } from "@/server/db/schema";
import type { AdminContactMessage, AdminMessagesQuery } from "@/types/admin";

import { iso, paginate, searchColumns } from "./shared";

const toMessage = ({
  ipHash: _ipHash,
  ...row
}: typeof contactMessages.$inferSelect): AdminContactMessage => ({
  ...row,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const messagesAdmin = {
  list: async (query: Partial<AdminMessagesQuery> = {}) => {
    const where = and(
      searchColumns(query.q, {
        text: [
          contactMessages.name,
          contactMessages.phone,
          contactMessages.email,
          contactMessages.subject,
        ],
      }),
      query.status ? eq(contactMessages.status, query.status) : undefined,
      query.department ? eq(contactMessages.department, query.department) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(contactMessages).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(contactMessages)
          .where(where)
          .orderBy(desc(contactMessages.createdAt))
          .limit(limit)
          .offset(offset),
      (rows) => rows.map(toMessage),
    );
  },
  get: async (id: string) => {
    const [row] = await getDb().select().from(contactMessages).where(eq(contactMessages.id, id));
    return row ? toMessage(row) : null;
  },
};
