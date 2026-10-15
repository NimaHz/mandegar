import "server-only";

import { asc, count, eq, inArray } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { categories, products } from "@/server/db/schema";
import type { AdminCategory, AdminListQuery, AdminOption } from "@/types/admin";

import { orderByIds } from "../db/mappers";
import { iso, paginate, searchColumns, toMediaRefOrNull } from "./shared";

const productCounts = async (ids: string[]) => {
  if (ids.length === 0) return new Map<string, number>();
  const rows = await getDb()
    .select({ categoryId: products.categoryId, total: count() })
    .from(products)
    .where(inArray(products.categoryId, ids))
    .groupBy(products.categoryId);
  return new Map(rows.map((row) => [row.categoryId, row.total]));
};

const findRows = (ids: string[]) =>
  getDb().query.categories.findMany({
    where: (table) => inArray(table.id, ids),
    with: { image: true },
  });

type Row = Awaited<ReturnType<typeof findRows>>[number];

const toCategory = (row: Row, counts: Map<string, number>): AdminCategory => {
  const { image, ...category } = row;
  return {
    ...category,
    image: toMediaRefOrNull(image),
    productCount: counts.get(row.id) ?? 0,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  };
};

const hydrate = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const [rows, counts] = await Promise.all([findRows(ids), productCounts(ids)]);
  return orderByIds(ids, rows).map((row) => toCategory(row, counts));
};

export const categoriesAdmin = {
  list: async (query: Partial<AdminListQuery> = {}) => {
    const where = searchColumns(query.q, { localized: [categories.name], text: [categories.slug] });
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(categories).where(where),
      (limit, offset) =>
        getDb()
          .select({ id: categories.id })
          .from(categories)
          .where(where)
          .orderBy(asc(categories.sortOrder), asc(categories.slug))
          .limit(limit)
          .offset(offset),
      (rows) => hydrate(rows.map((row) => row.id)),
    );
  },
  get: async (id: string) => (await hydrate([id]))[0] ?? null,
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select({
        id: categories.id,
        slug: categories.slug,
        name: categories.name,
        parentId: categories.parentId,
      })
      .from(categories)
      .orderBy(asc(categories.sortOrder), asc(categories.slug));
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      label: row.name,
      hint: rows.find((parent) => parent.id === row.parentId)?.slug ?? null,
    }));
  },
  childCount: async (id: string) => {
    const [row] = await getDb()
      .select({ total: count() })
      .from(categories)
      .where(eq(categories.parentId, id));
    return row?.total ?? 0;
  },
};
