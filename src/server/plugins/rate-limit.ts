import { Elysia } from "elysia";

import { enforceRateLimit } from "@/server/lib/rate-limit";

import { security } from "./security";

export interface RateLimitRule {
  scope: string;
  limit: number;
  windowSec: number;
}

export const rateLimiter = new Elysia({ name: "rate-limit" }).use(security).macro({
  rateLimit: (rule: RateLimitRule) => ({
    async beforeHandle({ clientKey }) {
      await enforceRateLimit(`${rule.scope}:${clientKey}`, rule.limit, rule.windowSec);
    },
  }),
});
