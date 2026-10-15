import "server-only";

import { and, asc, count, desc, eq, inArray, lte, type SQL } from "drizzle-orm";

import { formatWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import { products, warrantyCodes, warrantyPolicies } from "@/server/db/schema";
import {
  type AdminListQuery,
  type AdminOption,
  type AdminSort,
  adminSorts,
  type AdminWarrantyCode,
  type AdminWarrantyCodesQuery,
  type AdminWarrantyPolicy,
} from "@/types/admin";

import { orderByIds } from "../db/mappers";
import { iso } from "../db/mappers";
import { paginate, searchColumns, sortedBy } from "./shared";

const codeOrders: Record<AdminSort<"warrantyCodes">, SQL[]> = {
  "year-desc": [
    desc(warrantyCodes.productionYear),
    asc(products.modelCode),
    asc(warrantyCodes.code),
  ],
  "updated-desc": [desc(warrantyCodes.updatedAt)],
  "created-desc": [desc(warrantyCodes.createdAt)],
  "model-asc": [asc(products.modelCode), desc(warrantyCodes.productionYear)],
};

const codeWhere = (query: Partial<AdminWarrantyCodesQuery>) =>
  and(
    searchColumns(query.q, { text: [warrantyCodes.code, products.modelCode, warrantyCodes.note] }),
    query.productId ? eq(warrantyCodes.productId, query.productId) : undefined,
    query.productionYear ? eq(warrantyCodes.productionYear, query.productionYear) : undefined,
    query.status ? eq(warrantyCodes.status, query.status) : undefined,
    query.kind ? eq(warrantyCodes.kind, query.kind) : undefined,
  );

const findCodes = (ids: string[]) =>
  getDb().query.warrantyCodes.findMany({
    where: (table) => inArray(table.id, ids),
    with: {
      product: { columns: { id: true, slug: true, name: true, modelCode: true } },
      policy: { columns: { id: true, name: true } },
    },
  });

type CodeRow = Awaited<ReturnType<typeof findCodes>>[number];

const toCode = (row: CodeRow): AdminWarrantyCode => ({
  id: row.id,
  code: row.code,
  formatted: formatWarrantyCode(row.code),
  kind: row.kind,
  status: row.status,
  productionYear: row.productionYear,
  note: row.note,
  issuedAt: iso(row.issuedAt),
  product: row.product,
  policy: row.policy,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

const hydrateCodes = async (ids: string[]) =>
  ids.length ? orderByIds(ids, await findCodes(ids)).map(toCode) : [];

const codeIds = (query: Partial<AdminWarrantyCodesQuery>, limit: number, offset: number) =>
  getDb()
    .select({ id: warrantyCodes.id })
    .from(warrantyCodes)
    .innerJoin(products, eq(products.id, warrantyCodes.productId))
    .where(codeWhere(query))
    .orderBy(...sortedBy(codeOrders, query.sort ?? adminSorts.warrantyCodes[0], warrantyCodes.id))
    .limit(limit)
    .offset(offset);

export const warrantyCodesAdmin = {
  list: async (query: Partial<AdminWarrantyCodesQuery> = {}) =>
    paginate(
      query.page,
      () =>
        getDb()
          .select({ total: count() })
          .from(warrantyCodes)
          .innerJoin(products, eq(products.id, warrantyCodes.productId))
          .where(codeWhere(query)),
      (limit, offset) => codeIds(query, limit, offset),
      (rows) => hydrateCodes(rows.map((row) => row.id)),
    ),
  get: async (id: string) => (await hydrateCodes([id]))[0] ?? null,
  byIds: (ids: string[]) => hydrateCodes(ids.slice(0, 500)),
  all: async (query: Partial<AdminWarrantyCodesQuery> = {}) =>
    hydrateCodes((await codeIds(query, 20_000, 0)).map((row) => row.id)),
};

const policyCodeCounts = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, number>();
  const rows = await getDb()
    .select({ policyId: warrantyCodes.policyId, total: count() })
    .from(warrantyCodes)
    .where(inArray(warrantyCodes.policyId, ids))
    .groupBy(warrantyCodes.policyId);
  return new Map(rows.map((row) => [row.policyId, row.total]));
};

const toPolicies = async (
  rows: (typeof warrantyPolicies.$inferSelect)[],
): Promise<AdminWarrantyPolicy[]> => {
  const counts = await policyCodeCounts(rows.map((row) => row.id));
  return rows.map((row) => ({
    ...row,
    codeCount: counts.get(row.id) ?? 0,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }));
};

export const warrantyPoliciesAdmin = {
  list: async (query: Partial<AdminListQuery> = {}) => {
    const where = searchColumns(query.q, { text: [warrantyPolicies.name] });
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(warrantyPolicies).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(warrantyPolicies)
          .where(where)
          .orderBy(desc(warrantyPolicies.effectiveFrom), asc(warrantyPolicies.name))
          .limit(limit)
          .offset(offset),
      toPolicies,
    );
  },
  get: async (id: string) =>
    (
      await toPolicies(
        await getDb().select().from(warrantyPolicies).where(eq(warrantyPolicies.id, id)),
      )
    )[0] ?? null,
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select()
      .from(warrantyPolicies)
      .orderBy(desc(warrantyPolicies.effectiveFrom), asc(warrantyPolicies.name));
    return rows.map((row) => ({
      id: row.id,
      slug: null,
      label: { fa: row.name, en: row.name },
      hint: `${row.months}`,
    }));
  },
  defaultFor: async (months: number) => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = await getDb()
      .select()
      .from(warrantyPolicies)
      .where(lte(warrantyPolicies.effectiveFrom, today))
      .orderBy(desc(warrantyPolicies.effectiveFrom));
    return rows.find((row) => row.months === months) ?? rows[0] ?? null;
  },
};
