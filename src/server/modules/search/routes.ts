import { Elysia } from "elysia";

import { rateLimiter } from "@/server/plugins/rate-limit";

import { searchQuerySchema } from "./schema";
import { searchSite } from "./service";

export const searchRoutes = new Elysia()
  .use(rateLimiter)
  .get("/search", ({ query }) => searchSite(query.locale, query.q), {
    query: searchQuerySchema,
    rateLimit: { scope: "search", limit: 60, windowSec: 60 },
  });
