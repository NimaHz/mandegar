import "server-only";

import { getTableColumns, getTableName, is, Table } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/config/env";

import * as schema from "./schema";

const CONNECT_TIMEOUT_SEC = 10;
const STATEMENT_TIMEOUT_MS = 30_000;

const createDatabase = () =>
  drizzle({
    client: postgres(getEnv().DATABASE_URL, {
      connect_timeout: CONNECT_TIMEOUT_SEC,
      connection: { application_name: "mandegar", statement_timeout: STATEMENT_TIMEOUT_MS },
    }),
    schema,
    casing: "snake_case",
  });

export type Database = ReturnType<typeof createDatabase>;

type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type Executor = Database | Transaction;

const schemaKey = Object.values(schema)
  .filter((value) => is(value, Table))
  .flatMap((table) =>
    Object.keys(getTableColumns(table)).map((column) => `${getTableName(table)}.${column}`),
  )
  .join(",");

const globalForDb = globalThis as typeof globalThis & {
  mandegarDatabases?: Map<string, Database>;
};

let database: Database | undefined;

export const getDb = (): Database => {
  if (database) return database;
  const cache = (globalForDb.mandegarDatabases ??= new Map());
  const created = cache.get(schemaKey) ?? createDatabase();
  if (process.env.NODE_ENV !== "production") cache.set(schemaKey, created);
  database = created;
  return created;
};

export const closeDb = async () => {
  if (!database) return;
  await database.$client.end();
  globalForDb.mandegarDatabases?.delete(schemaKey);
  database = undefined;
};
