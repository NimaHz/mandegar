import "server-only";

import { sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";

export const checkHealth = async () => {
  const database = await getDb()
    .execute(sql`select 1`)
    .then(() => true)
    .catch(() => false);
  return {
    status: database ? ("ok" as const) : ("degraded" as const),
    database,
    time: new Date().toISOString(),
  };
};
