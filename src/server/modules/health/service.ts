import "server-only";

import { sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { getServerEnv } from "@/server/env";

const checkConfiguration = () => {
  try {
    getServerEnv();
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const checkDatabase = async () => {
  try {
    await getDb().execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
};

export const checkHealth = async () => {
  const configuration = checkConfiguration();
  const database = await checkDatabase();
  return {
    status: configuration && database ? ("ok" as const) : ("degraded" as const),
    configuration,
    database,
    time: new Date().toISOString(),
  };
};
