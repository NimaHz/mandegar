import "server-only";

import { and, type AnyColumn, asc, count, desc, eq, inArray, or, type SQL, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import {
  authors,
  brands,
  categories,
  guides,
  heroSlides,
  media,
  posts,
  productImages,
  products,
  ticketMessages,
  users,
} from "@/server/db/schema";
import {
  type AdminMedia,
  type AdminMediaQuery,
  type AdminMediaUsage,
  type AdminSort,
  adminSorts,
} from "@/types/admin";
import type { LocalizedText } from "@/types/common";

import { orderByIds } from "../db/mappers";
import {
  collated,
  iso,
  type MediaRow,
  paginate,
  searchColumns,
  sortedBy,
  toMediaRef,
} from "./shared";

const orders: Record<AdminSort<"media">, SQL[]> = {
  "created-desc": [desc(media.createdAt)],
  "updated-desc": [desc(media.updatedAt)],
  "name-asc": [asc(collated(sql`coalesce(${media.originalName}, ${media.storageKey})`))],
};

const hydrate = async (rows: MediaRow[]): Promise<AdminMedia[]> => {
  const uploaderIds = [...new Set(rows.flatMap((row) => (row.uploadedBy ? [row.uploadedBy] : [])))];
  const uploaders = uploaderIds.length
    ? await getDb()
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(inArray(users.id, uploaderIds))
    : [];
  return rows.map((row) => ({
    ...toMediaRef(row),
    storageKey: row.storageKey,
    size: row.size,
    durationSec: row.durationSec,
    sha256: row.sha256,
    originalName: row.originalName,
    uploadedBy: uploaders.find((user) => user.id === row.uploadedBy) ?? null,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }));
};

const contains = (column: AnyColumn, value: unknown) =>
  sql`${column} @> ${JSON.stringify(value)}::jsonb`;

const usage = (
  entity: string,
  rows: { id: string; label: LocalizedText | string }[],
): AdminMediaUsage[] =>
  rows.map((row) => ({
    entity,
    id: row.id,
    label: typeof row.label === "string" ? row.label : row.label.fa || row.label.en,
  }));

export const mediaAdmin = {
  list: async (query: Partial<AdminMediaQuery> = {}) => {
    const where = and(
      searchColumns(query.q, {
        localized: [media.alt],
        text: [media.originalName, media.storageKey],
      }),
      query.kind ? eq(media.kind, query.kind) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(media).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(media)
          .where(where)
          .orderBy(...sortedBy(orders, query.sort ?? adminSorts.media[0], media.id))
          .limit(limit)
          .offset(offset),
      hydrate,
    );
  },
  get: async (id: string) => {
    const rows = await getDb().select().from(media).where(eq(media.id, id));
    return (await hydrate(rows))[0] ?? null;
  },
  byIds: async (ids: string[]) =>
    ids.length
      ? orderByIds(
          ids,
          await hydrate(await getDb().select().from(media).where(inArray(media.id, ids))),
        )
      : [],
  usages: async (id: string): Promise<AdminMediaUsage[]> => {
    const db = getDb();
    const [
      brandRows,
      categoryRows,
      imageRows,
      downloadRows,
      guideRows,
      slideRows,
      authorRows,
      postRows,
      messageRows,
    ] = await Promise.all([
      db
        .select({ id: brands.id, label: brands.name })
        .from(brands)
        .where(eq(brands.logoMediaId, id)),
      db
        .select({ id: categories.id, label: categories.name })
        .from(categories)
        .where(eq(categories.imageMediaId, id)),
      db
        .select({ id: products.id, label: products.name })
        .from(productImages)
        .innerJoin(products, eq(products.id, productImages.productId))
        .where(eq(productImages.mediaId, id)),
      db
        .select({ id: products.id, label: products.name })
        .from(products)
        .where(contains(products.downloads, [{ mediaId: id }])),
      db
        .select({ id: guides.id, label: guides.title })
        .from(guides)
        .where(
          or(
            sql`${guides.video}->>'mediaId' = ${id}`,
            sql`${guides.video}->>'posterMediaId' = ${id}`,
            contains(guides.steps, [{ mediaId: id }]),
          ),
        ),
      db
        .select({ id: heroSlides.id, label: heroSlides.title })
        .from(heroSlides)
        .where(or(eq(heroSlides.imageMediaId, id), eq(heroSlides.mobileImageMediaId, id))),
      db
        .select({ id: authors.id, label: authors.name })
        .from(authors)
        .where(eq(authors.avatarMediaId, id)),
      db.select({ id: posts.id, label: posts.title }).from(posts).where(eq(posts.coverMediaId, id)),
      db
        .select({ id: ticketMessages.ticketId, label: ticketMessages.body })
        .from(ticketMessages)
        .where(sql`${id}::uuid = any(${ticketMessages.attachmentMediaIds})`),
    ]);
    return [
      ...usage("brand", brandRows),
      ...usage("category", categoryRows),
      ...usage("product", imageRows),
      ...usage("product-download", downloadRows),
      ...usage("guide", guideRows),
      ...usage("slide", slideRows),
      ...usage("author", authorRows),
      ...usage("post", postRows),
      ...usage(
        "ticket",
        messageRows.map((row) => ({ id: row.id, label: row.label.slice(0, 80) })),
      ),
    ];
  },
};
