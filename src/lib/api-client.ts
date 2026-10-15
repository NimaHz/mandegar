import { treaty } from "@elysia/eden";

import type { App } from "@/server/app";

const origin =
  typeof window === "undefined"
    ? (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
    : window.location.origin;

export const apiClient = treaty<App>(origin, { fetch: { credentials: "include" } });
