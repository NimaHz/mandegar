import { Elysia } from "elysia";

import { checkHealth } from "./service";

export const healthRoutes = new Elysia().get("/health", async ({ set }) => {
  const health = await checkHealth();
  if (!health.database) set.status = 503;
  return health;
});
