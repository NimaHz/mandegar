import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { getEnv } from "@/config/env";

import * as schema from "./schema";

const createDatabase = () =>
  drizzle({
    client: postgres(getEnv().DATABASE_URL),
    schema,
    casing: "snake_case",
  });

export type Database = ReturnType<typeof createDatabase>;

export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

export type Executor = Database | Transaction;

const globalForDb = globalThis as typeof globalThis & { mandegarDb?: Database };

let database: Database | undefined;

export const getDb = (): Database => {
  database ??= globalForDb.mandegarDb ?? createDatabase();
  if (process.env.NODE_ENV !== "production") globalForDb.mandegarDb = database;
  return database;
};

export const closeDb = async () => {
  if (!database) return;
  await database.$client.end();
  database = undefined;
  globalForDb.mandegarDb = undefined;
};
