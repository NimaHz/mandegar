import "server-only";

import { cache } from "react";

import { adminApi } from "@/services/admin";

export const getAdminStats = cache(() => adminApi.stats.get());

export const hasFilters = (params: Record<string, string | string[] | undefined>) =>
  Object.entries(params).some(([key, value]) => key !== "page" && Boolean(value));

export const getRequestTime = cache(() => Date.now());
