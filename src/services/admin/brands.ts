import "server-only";

import { asc, count, inArray } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { brands, products } from "@/server/db/schema";
import type { AdminBrand, AdminListQuery, AdminOption } from "@/types/admin";

import { orderByIds } from "../db/mappers";
import { iso } from "../db/mappers";
import { paginate, searchColumns, toMediaRefOrNull } from "./shared";

const hydrate = async (ids: string[]): Promise<AdminBrand[]> => {
  if (ids.length === 0) return [];
  const [rows, counts] = await Promise.all([
    getDb().query.brands.findMany({
      where: (table) => inArray(table.id, ids),
      with: { logo: true },
    }),
    getDb()
      .select({ brandId: products.brandId, total: count() })
      .from(products)
      .where(inArray(products.brandId, ids))
      .groupBy(products.brandId),
  ]);
  return orderByIds(ids, rows).map(({ logo, ...row }) => ({
    ...row,
    logo: toMediaRefOrNull(logo),
    productCount: counts.find((entry) => entry.brandId === row.id)?.total ?? 0,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }));
};

export const brandsAdmin = {
  list: async (query: Partial<AdminListQuery> = {}) => {
    const where = searchColumns(query.q, { localized: [brands.name], text: [brands.slug] });
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(brands).where(where),
      (limit, offset) =>
        getDb()
          .select({ id: brands.id })
          .from(brands)
          .where(where)
          .orderBy(asc(brands.sortOrder), asc(brands.slug))
          .limit(limit)
          .offset(offset),
      (rows) => hydrate(rows.map((row) => row.id)),
    );
  },
  get: async (id: string) => (await hydrate([id]))[0] ?? null,
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select({ id: brands.id, slug: brands.slug, name: brands.name, isOwn: brands.isOwn })
      .from(brands)
      .orderBy(asc(brands.sortOrder));
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      label: row.name,
      hint: row.isOwn ? "own" : null,
    }));
  },
};
