import { Elysia } from "elysia";

import { rateLimiter } from "@/server/plugins/rate-limit";

import { issueChallenge } from "./service";

export const altchaRoutes = new Elysia({ prefix: "/altcha" })
  .use(rateLimiter)
  .get("/challenge", () => issueChallenge(), {
    rateLimit: { scope: "altcha", limit: 60, windowSec: 60 },
  });
