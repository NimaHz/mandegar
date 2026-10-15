import "server-only";

import { eq } from "drizzle-orm";
import type { z } from "zod";

import { getEnv } from "@/config/env";
import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { createWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import { products, warrantyCodes, warrantyPolicies } from "@/server/db/schema";
import { toCsv } from "@/server/lib/csv";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { conflict, notFound, orNotFound, ValidationFailure } from "@/server/lib/http-error";
import { revalidatePages } from "@/server/lib/revalidate";
import { api } from "@/services";
import { warrantyCodesAdmin, warrantyPoliciesAdmin } from "@/services/admin/warranty";
import type { AdminWarrantyCodesQuery } from "@/types/admin";
import type { WarrantyLookup } from "@/types/warranty";

import type {
  warrantyCodeStatusSchema,
  warrantyGenerateSchema,
  warrantyPolicyInputSchema,
  warrantyPolicyPatchSchema,
} from "./schema";

export const lookupWarranty = (
  locale: Locale,
  code: string,
  clientKey: string,
): Promise<WarrantyLookup> => api.warranty.lookup(locale, code, clientKey);

export const createWarrantyPolicy = async (input: z.output<typeof warrantyPolicyInputSchema>) => {
  const [row] = await guardWrite(() => getDb().insert(warrantyPolicies).values(input).returning());
  if (!row) throw new Error("Policy insert failed");
  revalidatePages([routes.warranty]);
  return orNotFound(await warrantyPoliciesAdmin.get(row.id));
};

export const updateWarrantyPolicy = async (
  id: string,
  patch: z.output<typeof warrantyPolicyPatchSchema>,
) => {
  orNotFound(await warrantyPoliciesAdmin.get(id), "Policy not found");
  await guardWrite(() =>
    getDb().update(warrantyPolicies).set(patch).where(eq(warrantyPolicies.id, id)),
  );
  revalidatePages([routes.warranty]);
  return orNotFound(await warrantyPoliciesAdmin.get(id));
};

export const deleteWarrantyPolicy = async (id: string) => {
  orNotFound(await warrantyPoliciesAdmin.get(id), "Policy not found");
  await guardDelete(() => getDb().delete(warrantyPolicies).where(eq(warrantyPolicies.id, id)));
  revalidatePages([routes.warranty]);
  return { id };
};

const resolvePolicyId = async (policyId: string | undefined, warrantyMonths: number) => {
  if (policyId) return policyId;
  const policy = await warrantyPoliciesAdmin.defaultFor(warrantyMonths);
  if (!policy) throw new ValidationFailure({ policyId: "Create a warranty policy first" });
  return policy.id;
};

export const generateBatchCode = async (input: z.output<typeof warrantyGenerateSchema>) => {
  const [product] = await getDb()
    .select({ id: products.id, warrantyMonths: products.warrantyMonths })
    .from(products)
    .where(eq(products.id, input.productId));
  if (!product) throw new ValidationFailure({ productId: "Referenced item not found" });
  const policyId = await resolvePolicyId(input.policyId, product.warrantyMonths);
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const [row] = await guardWrite(() =>
        getDb()
          .insert(warrantyCodes)
          .values({
            code: createWarrantyCode(input.productionYear),
            kind: "batch",
            productId: product.id,
            productionYear: input.productionYear,
            policyId,
            note: input.note ?? null,
          })
          .returning({ id: warrantyCodes.id }),
      );
      if (row) return orNotFound(await warrantyCodesAdmin.get(row.id));
    } catch (error) {
      if (error instanceof ValidationFailure && error.fields.batch) {
        throw conflict("A batch code already exists for this product and year");
      }
      if (!(error instanceof ValidationFailure && error.fields.code)) throw error;
    }
  }
  throw new Error("Could not allocate a unique warranty code");
};

export const setWarrantyCodeStatus = async (
  id: string,
  input: z.output<typeof warrantyCodeStatusSchema>,
) => {
  const [row] = await getDb()
    .update(warrantyCodes)
    .set({ status: input.status, ...(input.note === undefined ? {} : { note: input.note }) })
    .where(eq(warrantyCodes.id, id))
    .returning({ id: warrantyCodes.id });
  if (!row) throw notFound("Warranty code not found");
  return orNotFound(await warrantyCodesAdmin.get(id));
};

export const exportWarrantyCodes = async (query: Partial<AdminWarrantyCodesQuery>) => {
  const origin = new URL(getEnv().APP_ORIGIN).origin;
  const codes = await warrantyCodesAdmin.all(query);
  return toCsv([
    [
      "code",
      "formatted",
      "model",
      "product_fa",
      "product_en",
      "year",
      "status",
      "policy",
      "issued_at",
      "link",
    ],
    ...codes.map((code) => [
      code.code,
      code.formatted,
      code.product.modelCode,
      code.product.name.fa,
      code.product.name.en,
      code.productionYear,
      code.status,
      code.policy.name,
      code.issuedAt.slice(0, 10),
      `${origin}${routes.warrantyShort(code.code)}`,
    ]),
  ]);
};
