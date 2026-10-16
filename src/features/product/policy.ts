import type { WarrantyPolicySummary } from "@/types/warranty";

export const policyFor = (policies: WarrantyPolicySummary[], months: number) =>
  policies.find((policy) => policy.months === months) ?? null;
