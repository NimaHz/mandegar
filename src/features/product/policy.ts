import type { WarrantyPolicySummary } from "@/types/warranty";

export const policyFor = (policies: WarrantyPolicySummary[], months: number) =>
  policies.find((policy) => policy.months === months) ??
  policies.toSorted(
    (left, right) => Math.abs(left.months - months) - Math.abs(right.months - months),
  )[0] ??
  null;
