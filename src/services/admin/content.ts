import "server-only";

import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { authors, faqs, heroSlides, posts, serviceCenters } from "@/server/db/schema";
import {
  type AdminAuthor,
  type AdminFaq,
  type AdminFaqsQuery,
  type AdminListQuery,
  type AdminOption,
  type AdminPost,
  type AdminPostListItem,
  type AdminPostsQuery,
  type AdminServiceCenter,
  type AdminServiceCentersQuery,
  type AdminSlide,
  type AdminSort,
  adminSorts,
} from "@/types/admin";

import { orderByIds } from "../db/mappers";
import { iso, isoOrNull } from "../db/mappers";
import {
  collatedName,
  paginate,
  searchColumns,
  sortedBy,
  toMediaRef,
  toMediaRefOrNull,
} from "./shared";

const findSlides = (ids: string[]) =>
  getDb().query.heroSlides.findMany({
    where: (table) => inArray(table.id, ids),
    with: { image: true, mobileImage: true },
  });

const hydrateSlides = async (ids: string[]): Promise<AdminSlide[]> =>
  ids.length === 0
    ? []
    : orderByIds(ids, await findSlides(ids)).map(({ image, mobileImage, ...row }) => ({
        ...row,
        image: toMediaRef(image),
        mobileImage: toMediaRefOrNull(mobileImage),
        startsAt: isoOrNull(row.startsAt),
        endsAt: isoOrNull(row.endsAt),
        createdAt: iso(row.createdAt),
        updatedAt: iso(row.updatedAt),
      }));

export const slidesAdmin = {
  list: async (query: Partial<AdminListQuery> = {}) => {
    const where = searchColumns(query.q, { localized: [heroSlides.title] });
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(heroSlides).where(where),
      (limit, offset) =>
        getDb()
          .select({ id: heroSlides.id })
          .from(heroSlides)
          .where(where)
          .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt), asc(heroSlides.id))
          .limit(limit)
          .offset(offset),
      (rows) => hydrateSlides(rows.map((row) => row.id)),
    );
  },
  all: async () => {
    const rows = await getDb()
      .select({ id: heroSlides.id })
      .from(heroSlides)
      .orderBy(asc(heroSlides.sortOrder), asc(heroSlides.createdAt), asc(heroSlides.id));
    return hydrateSlides(rows.map((row) => row.id));
  },
  get: async (id: string) => (await hydrateSlides([id]))[0] ?? null,
};

const toFaq = (row: typeof faqs.$inferSelect): AdminFaq => ({
  ...row,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const faqsAdmin = {
  list: async (query: Partial<AdminFaqsQuery> = {}) => {
    const where = and(
      searchColumns(query.q, { localized: [faqs.question, faqs.answer] }),
      query.group ? eq(faqs.group, query.group) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(faqs).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(faqs)
          .where(where)
          .orderBy(asc(faqs.group), asc(faqs.sortOrder), asc(faqs.createdAt), asc(faqs.id))
          .limit(limit)
          .offset(offset),
      (rows) => rows.map(toFaq),
    );
  },
  get: async (id: string) => {
    const [row] = await getDb().select().from(faqs).where(eq(faqs.id, id));
    return row ? toFaq(row) : null;
  },
};

const centerOrders: Record<AdminSort<"serviceCenters">, SQL[]> = {
  "province-asc": [asc(serviceCenters.province), asc(serviceCenters.slug)],
  "updated-desc": [desc(serviceCenters.updatedAt)],
  "created-desc": [desc(serviceCenters.createdAt)],
  "name-asc": [asc(collatedName(serviceCenters.name))],
};

const toServiceCenter = (row: typeof serviceCenters.$inferSelect): AdminServiceCenter => ({
  ...row,
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
});

export const serviceCentersAdmin = {
  list: async (query: Partial<AdminServiceCentersQuery> = {}) => {
    const where = and(
      searchColumns(query.q, {
        localized: [serviceCenters.name, serviceCenters.city, serviceCenters.address],
        text: [serviceCenters.slug],
      }),
      query.province ? eq(serviceCenters.province, query.province) : undefined,
      query.kind ? eq(serviceCenters.kind, query.kind) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(serviceCenters).where(where),
      (limit, offset) =>
        getDb()
          .select()
          .from(serviceCenters)
          .where(where)
          .orderBy(
            ...sortedBy(
              centerOrders,
              query.sort ?? adminSorts.serviceCenters[0],
              serviceCenters.id,
            ),
          )
          .limit(limit)
          .offset(offset),
      (rows) => rows.map(toServiceCenter),
    );
  },
  get: async (id: string) => {
    const [row] = await getDb().select().from(serviceCenters).where(eq(serviceCenters.id, id));
    return row ? toServiceCenter(row) : null;
  },
};

const hydrateAuthors = async (ids: string[]): Promise<AdminAuthor[]> => {
  if (ids.length === 0) return [];
  const [rows, counts] = await Promise.all([
    getDb().query.authors.findMany({
      where: (table) => inArray(table.id, ids),
      with: { avatar: true },
    }),
    getDb()
      .select({ authorId: posts.authorId, total: count() })
      .from(posts)
      .where(inArray(posts.authorId, ids))
      .groupBy(posts.authorId),
  ]);
  return orderByIds(ids, rows).map(({ avatar, ...row }) => ({
    ...row,
    avatar: toMediaRefOrNull(avatar),
    postCount: counts.find((entry) => entry.authorId === row.id)?.total ?? 0,
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
  }));
};

export const authorsAdmin = {
  list: async (query: Partial<AdminListQuery> = {}) => {
    const where = searchColumns(query.q, { localized: [authors.name], text: [authors.slug] });
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(authors).where(where),
      (limit, offset) =>
        getDb()
          .select({ id: authors.id })
          .from(authors)
          .where(where)
          .orderBy(asc(authors.slug))
          .limit(limit)
          .offset(offset),
      (rows) => hydrateAuthors(rows.map((row) => row.id)),
    );
  },
  get: async (id: string) => (await hydrateAuthors([id]))[0] ?? null,
  options: async (): Promise<AdminOption[]> => {
    const rows = await getDb()
      .select({ id: authors.id, slug: authors.slug, name: authors.name })
      .from(authors)
      .orderBy(asc(authors.slug));
    return rows.map((row) => ({ id: row.id, slug: row.slug, label: row.name, hint: null }));
  },
};

const findPosts = (ids: string[]) =>
  getDb().query.posts.findMany({
    where: (table) => inArray(table.id, ids),
    with: { author: { columns: { id: true, slug: true, name: true } }, cover: true },
  });

type PostRow = Awaited<ReturnType<typeof findPosts>>[number];

const postOrders: Record<AdminSort<"posts">, SQL[]> = {
  "updated-desc": [desc(posts.updatedAt)],
  "created-desc": [desc(posts.createdAt)],
  "name-asc": [asc(collatedName(posts.title))],
};

const toPostListItem = (row: PostRow): AdminPostListItem => ({
  id: row.id,
  slug: row.slug,
  kind: row.kind,
  title: row.title,
  status: row.status,
  author: row.author,
  cover: toMediaRefOrNull(row.cover),
  publishedAt: isoOrNull(row.publishedAt),
  updatedAt: iso(row.updatedAt),
});

export const postsAdmin = {
  list: async (query: Partial<AdminPostsQuery> = {}) => {
    const where = and(
      searchColumns(query.q, { localized: [posts.title], text: [posts.slug] }),
      query.kind ? eq(posts.kind, query.kind) : undefined,
      query.status ? eq(posts.status, query.status) : undefined,
      query.authorId ? eq(posts.authorId, query.authorId) : undefined,
    );
    return paginate(
      query.page,
      () => getDb().select({ total: count() }).from(posts).where(where),
      (limit, offset) =>
        getDb()
          .select({ id: posts.id })
          .from(posts)
          .where(where)
          .orderBy(...sortedBy(postOrders, query.sort ?? adminSorts.posts[0], posts.id))
          .limit(limit)
          .offset(offset),
      async (rows) => {
        const ids = rows.map((row) => row.id);
        return ids.length ? orderByIds(ids, await findPosts(ids)).map(toPostListItem) : [];
      },
    );
  },
  get: async (id: string): Promise<AdminPost | null> => {
    const [row] = await findPosts([id]);
    if (!row) return null;
    const { author: _author, cover, ...post } = row;
    return {
      ...post,
      cover: toMediaRefOrNull(cover),
      publishedAt: isoOrNull(row.publishedAt),
      createdAt: iso(row.createdAt),
      updatedAt: iso(row.updatedAt),
    };
  },
};
