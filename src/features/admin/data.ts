import "server-only";

import { cache } from "react";

import { adminApi } from "@/services/admin";
import type { Permission } from "@/types/admin";

export const getAdminStats = cache((permissions: readonly Permission[]) =>
  adminApi.stats.get(permissions),
);

export const getAdminCounts = cache(() => adminApi.stats.counts());

const NON_FILTER_KEYS = new Set(["page", "sort"]);

export const hasFilters = (params: Record<string, string | string[] | undefined>) =>
  Object.entries(params).some(([key, value]) => !NON_FILTER_KEYS.has(key) && Boolean(value));

export const getRequestTime = cache(() => Date.now());
