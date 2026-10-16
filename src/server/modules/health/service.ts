import "server-only";

import { sql } from "drizzle-orm";

import { siteConfig } from "@/config/site";
import { getDb } from "@/server/db/client";
import { getServerEnv, isProduction, productionEnvIssues } from "@/server/env";

const checkConfiguration = () => {
  try {
    getServerEnv();
  } catch (error) {
    console.error(error);
    return false;
  }
  const issues = isProduction() ? productionEnvIssues(process.env, siteConfig.url) : [];
  if (issues.length === 0) return true;
  console.error(
    `Invalid production environment:\n${issues.map((issue) => `✖ ${issue}`).join("\n")}`,
  );
  return false;
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
