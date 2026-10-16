import { z } from "zod";

import {
  listQuerySchema,
  localeSchema,
  localizedText,
  optionalFilter,
  sortSchema,
} from "@/server/lib/validation";
import { adminSorts, warrantyCodeKinds, warrantyCodeStatuses } from "@/types/admin";

export const warrantyLookupSchema = z.object({
  code: z.string().max(64),
  locale: localeSchema,
});

export const warrantyPolicyInputSchema = z.object({
  name: localizedText(80),
  months: z.number().int().min(0).max(240),
  partsMonths: z.number().int().min(0).max(240).nullable(),
  startRule: localizedText(400),
  coverage: z.array(localizedText(300)).max(30),
  exclusions: z.array(localizedText(300)).max(30),
  effectiveFrom: z.iso.date(),
});

export const warrantyPolicyPatchSchema = warrantyPolicyInputSchema.partial();

export const warrantyPoliciesQuerySchema = listQuerySchema;

export const warrantyCodesQuerySchema = listQuerySchema.extend({
  productId: optionalFilter(z.uuid()),
  productionYear: optionalFilter(z.coerce.number().int().min(1400).max(1431)),
  status: optionalFilter(z.enum(warrantyCodeStatuses)),
  kind: optionalFilter(z.enum(warrantyCodeKinds)),
  sort: sortSchema(adminSorts.warrantyCodes),
});

export const warrantyGenerateSchema = z.object({
  productId: z.uuid(),
  productionYear: z.number().int().min(1400).max(1431),
  policyId: z.uuid().optional(),
  note: z.string().trim().max(300).optional(),
});

export const warrantyCodeStatusSchema = z.object({
  status: z.enum(warrantyCodeStatuses),
  note: z.string().trim().max(300).nullable().optional(),
});

export const LABELS_PER_PRINT = 100;

export const warrantyLabelsQuerySchema = z.object({
  ids: z
    .string()
    .max(20_000)
    .transform((value) => value.split(",").filter(Boolean))
    .pipe(z.array(z.uuid()).max(LABELS_PER_PRINT)),
});
