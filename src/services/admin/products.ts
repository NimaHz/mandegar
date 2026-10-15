import "server-only";

import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { products } from "@/server/db/schema";
import {
  type AdminOption,
  type AdminProduct,
  type AdminProductListItem,
  type AdminProductsQuery,
  type AdminSort,
  adminSorts,
} from "@/types/admin";

import { orderByIds } from "../db/mappers";
import {
  collatedName,
  iso,
  isoOrNull,
  mediaRefs,
  paginate,
  searchColumns,
  sortedBy,
  toMediaRef,
  toMediaRefOrNull,
} from "./shared";

const orders: Record<AdminSort<"products">, SQL[]> = {
  "updated-desc": [desc(products.updatedAt)],
  "created-desc": [desc(products.createdAt)],
  "name-asc": [asc(collatedName(products.name))],
  "model-asc": [asc(products.modelCode)],
};

const whereOf = (query: Partial<AdminProductsQuery>) =>
  and(
    searchColumns(query.q, {
      localized: [products.name],
      text: [products.modelCode, products.slug],
    }),
    query.status ? eq(products.status, query.status) : undefined,
    query.categoryId ? eq(products.categoryId, query.categoryId) : undefined,
    query.brandId ? eq(products.brandId, query.brandId) : undefined,
  );

const findListRows = (ids: string[]) =>
  getDb().query.products.findMany({
    where: (table) => inArray(table.id, ids),
    with: {
      category: { columns: { id: true, slug: true, name: true } },
      brand: { columns: { id: true, slug: true, name: true } },
      images: {
        orderBy: (image) => [desc(image.isPrimary), asc(image.sortOrder)],
        limit: 1,
        with: { media: true },
      },
    },
  });

type ListRow = Awaited<ReturnType<typeof findListRows>>[number];

const toListItem = (row: ListRow): AdminProductListItem => ({
  id: row.id,
  slug: row.slug,
  modelCode: row.modelCode,
  name: row.name,
  status: row.status,
  featured: row.featured,
  isNew: row.isNew,
  category: row.category,
  brand: row.brand,
  image: toMediaRefOrNull(row.images[0]?.media),
  warrantyMonths: row.warrantyMonths,
  publishedAt: isoOrNull(row.publishedAt),
  updatedAt: iso(row.updatedAt),
});

const findProduct = (id: string) =>
  getDb().query.products.findFirst({
    where: (table, { eq: equals }) => equals(table.id, id),
    with: {
      images: {
        orderBy: (image) => [asc(image.sortOrder)],
        with: { media: true },
      },
    },
  });

export const productsAdmin = {
  list: async (query: Partial<AdminProductsQuery> = {}) => {
    const where = whereOf(query);
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(products).where(where),
      (limit, offset) =>
        getDb()
          .select({ id: products.id })
          .from(products)
          .where(where)
          .orderBy(...sortedBy(orders, query.sort ?? adminSorts.products[0], products.id))
          .limit(limit)
          .offset(offset),
      async (rows) => {
        const ids = rows.map((row) => row.id);
        return ids.length ? orderByIds(ids, await findListRows(ids)).map(toListItem) : [];
      },
    );
  },
  get: async (id: string): Promise<AdminProduct | null> => {
    const row = await findProduct(id);
    if (!row) return null;
    const { images, searchKey: _searchKey, ...product } = row;
    return {
      ...product,
      publishedAt: isoOrNull(row.publishedAt),
      createdAt: iso(row.createdAt),
      updatedAt: iso(row.updatedAt),
      images: images.map((image) => ({
        id: image.id,
        mediaId: image.mediaId,
        media: toMediaRef(image.media),
        alt: image.alt,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })),
      media: await mediaRefs(row.downloads.map((download) => download.mediaId)),
    };
  },
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        modelCode: products.modelCode,
      })
      .from(products)
      .orderBy(asc(products.modelCode));
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      label: row.name,
      hint: row.modelCode,
    }));
  },
};
