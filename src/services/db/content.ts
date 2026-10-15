import { and, asc, count, desc, eq, gt, inArray, isNull, lte, or, type SQL } from "drizzle-orm";

import { siteConfig } from "@/config/site";
import type { Locale } from "@/i18n/config";
import { provinceName } from "@/lib/provinces";
import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import {
  authors,
  brands,
  categories,
  faqs,
  posts,
  products,
  serviceCenters,
  settings,
} from "@/server/db/schema";
import { clampPage, offsetOf, toPaginated } from "@/server/lib/pagination";
import { settingsSchemas } from "@/server/modules/settings/schema";
import type { SettingsValues } from "@/types/admin";
import type {
  AuthorSummary,
  GuideDetail,
  GuideListItem,
  GuideVideo,
  PostDetail,
  PostListItem,
  ServiceCenterKind,
  SiteSettings,
} from "@/types/content";

import type { ContentService } from "../contracts";
import {
  clampLimit,
  iso,
  isoOrNull,
  mediaIndex,
  type MediaRow,
  normalizeSlug,
  orderByIds,
  pick,
  pickOrNull,
  toImage,
  toSeo,
} from "./mappers";

const POSTS_PAGE_SIZE = 9;
const WORDS_PER_MINUTE: Record<Locale, number> = { fa: 180, en: 220 };

const defaultSettings: SettingsValues = {
  contact: {
    phones: [{ label: { fa: "دفتر مرکزی", en: "Head office" }, value: siteConfig.contact.phone }],
    emails: [{ label: { fa: "پشتیبانی", en: "Support" }, value: siteConfig.contact.email }],
    address: siteConfig.contact.address,
    hours: { fa: "شنبه تا چهارشنبه، ۸ تا ۱۷", en: "Saturday to Wednesday, 8:00 to 17:00" },
    socials: {
      aparat: null,
      instagram: null,
      telegram: null,
      bale: null,
      eitaa: null,
      rubika: null,
      linkedin: null,
    },
    location: null,
  },
  seo: {
    defaultTitle: { fa: siteConfig.name.fa, en: siteConfig.name.en },
    defaultDescription: { fa: siteConfig.name.fa, en: siteConfig.name.en },
  },
  stats: { years: 0, serviceCenters: 0, models: 0, warrantyMonths: 18 },
  company: {
    legalName: { fa: siteConfig.name.fa, en: siteConfig.name.en },
    nationalId: null,
    registrationNo: null,
    foundingYear: null,
  },
};

export const readSettings = async (): Promise<SettingsValues> => {
  const rows = await getDb().select().from(settings);
  const value = <TKey extends keyof SettingsValues>(key: TKey): SettingsValues[TKey] => {
    const parsed = settingsSchemas[key].safeParse(rows.find((row) => row.key === key)?.value);
    return parsed.success ? (parsed.data as SettingsValues[TKey]) : defaultSettings[key];
  };
  return {
    contact: value("contact"),
    seo: value("seo"),
    stats: value("stats"),
    company: value("company"),
  };
};

const toSiteSettings = (values: SettingsValues, locale: Locale): SiteSettings => ({
  phones: values.contact.phones.map((entry) => ({
    label: pick(entry.label, locale),
    value: entry.value,
  })),
  emails: values.contact.emails.map((entry) => ({
    label: pick(entry.label, locale),
    value: entry.value,
  })),
  address: pick(values.contact.address, locale),
  hours: pick(values.contact.hours, locale),
  socials: values.contact.socials,
  location: values.contact.location,
  stats: values.stats,
  company: {
    legalName: pick(values.company.legalName, locale),
    nationalId: values.company.nationalId,
    registrationNo: values.company.registrationNo,
    foundingYear: values.company.foundingYear,
  },
});

const isLivePost = () => and(eq(posts.status, "published"), lte(posts.publishedAt, new Date()));

const readingMinutes = (body: string, locale: Locale) =>
  Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / WORDS_PER_MINUTE[locale]));

const findPostRows = (ids: string[]) =>
  getDb().query.posts.findMany({
    where: (table) => inArray(table.id, ids),
    with: { author: { with: { avatar: true } }, cover: true },
  });

type PostRow = Awaited<ReturnType<typeof findPostRows>>[number];

const toAuthorSummary = (author: PostRow["author"], locale: Locale): AuthorSummary => ({
  slug: author.slug,
  name: pick(author.name, locale),
  role: pick(author.role, locale),
  avatar: toImage(author.avatar, locale, pick(author.name, locale)),
});

const toPostListItem = (row: PostRow, locale: Locale): PostListItem => ({
  slug: row.slug,
  kind: row.kind,
  title: pick(row.title, locale),
  excerpt: pick(row.excerpt, locale),
  cover: toImage(row.cover, locale, pick(row.title, locale)),
  author: toAuthorSummary(row.author, locale),
  readingMinutes: readingMinutes(pick(row.body, locale), locale),
  publishedAt: iso(row.publishedAt ?? row.createdAt),
});

const hydratePosts = async (locale: Locale, ids: string[]) =>
  ids.length === 0
    ? []
    : orderByIds(ids, await findPostRows(ids)).map((row) => toPostListItem(row, locale));

const livePostIds = async (where: SQL | undefined, limit: number, offset = 0) => {
  const rows = await getDb()
    .select({ id: posts.id })
    .from(posts)
    .where(and(isLivePost(), where))
    .orderBy(desc(posts.publishedAt), desc(posts.id))
    .limit(limit)
    .offset(offset);
  return rows.map((row) => row.id);
};

const countLivePosts = async (where: SQL | undefined) => {
  const [row] = await getDb()
    .select({ total: count() })
    .from(posts)
    .where(and(isLivePost(), where));
  return row?.total ?? 0;
};

const findAuthorWithPosts = async (slug: string) => {
  const author = await getDb().query.authors.findFirst({
    where: (table, { eq: equals }) => equals(table.slug, normalizeSlug(slug)),
    with: { avatar: true },
  });
  if (!author) return null;
  return (await countLivePosts(eq(posts.authorId, author.id))) > 0 ? author : null;
};

const visibleProductsWhere = and(
  eq(products.status, "published"),
  eq(categories.published, true),
  eq(brands.published, true),
);

const visibleProductRows = (where: SQL | undefined) =>
  getDb()
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      modelCode: products.modelCode,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(visibleProductsWhere, where))
    .orderBy(asc(products.modelCode));

const publishedGuides = () =>
  getDb().query.guides.findMany({
    where: (table, { eq: equals }) => equals(table.published, true),
    orderBy: (table) => [desc(table.publishedAt), asc(table.slug)],
  });

type GuideRow = Awaited<ReturnType<typeof publishedGuides>>[number];

const guideCategories = async () =>
  getDb()
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      parentId: categories.parentId,
      defaultGuideId: categories.defaultGuideId,
    })
    .from(categories)
    .where(eq(categories.published, true))
    .orderBy(asc(categories.sortOrder));

type GuideCategory = Awaited<ReturnType<typeof guideCategories>>[number];

const toGuideListItem = (
  row: GuideRow,
  categoryRows: GuideCategory[],
  index: Map<string, MediaRow>,
  locale: Locale,
): GuideListItem => ({
  slug: row.slug,
  title: pick(row.title, locale),
  summary: pick(row.summary, locale),
  poster: toImage(
    row.video?.posterMediaId ? index.get(row.video.posterMediaId) : null,
    locale,
    pick(row.title, locale),
  ),
  durationSec: row.durationSec,
  stepCount: row.steps.length,
  categories: categoryRows
    .filter((category) => category.defaultGuideId === row.id)
    .map((category) => ({ slug: category.slug, name: pick(category.name, locale) })),
});

const toGuideVideo = (
  row: GuideRow,
  index: Map<string, MediaRow>,
  locale: Locale,
): GuideVideo | null => {
  if (!row.video) return null;
  const poster = toImage(
    row.video.posterMediaId ? index.get(row.video.posterMediaId) : null,
    locale,
    pick(row.title, locale),
  );
  if (row.video.kind === "aparat") return { kind: "aparat", hash: row.video.hash, poster };
  const file = index.get(row.video.mediaId);
  return file?.kind === "video"
    ? { kind: "upload", src: routes.upload(file.storageKey), mime: file.mime, poster }
    : null;
};

const guideMediaIds = (row: GuideRow) => [
  row.video?.posterMediaId,
  row.video?.kind === "upload" ? row.video.mediaId : null,
  ...row.steps.map((step) => step.mediaId),
];

const guideProducts = async (guideId: string, categoryRows: GuideCategory[]) => {
  const direct = categoryRows.filter((category) => category.defaultGuideId === guideId);
  const inherited = categoryRows.filter(
    (category) =>
      category.defaultGuideId === null && direct.some((parent) => parent.id === category.parentId),
  );
  const categoryIds = [...direct, ...inherited].map((category) => category.id);
  return visibleProductRows(
    or(
      eq(products.guideId, guideId),
      categoryIds.length > 0
        ? and(isNull(products.guideId), inArray(products.categoryId, categoryIds))
        : undefined,
    ),
  );
};

const matchesKind = (kind: ServiceCenterKind) =>
  kind === "both" ? eq(serviceCenters.kind, "both") : inArray(serviceCenters.kind, [kind, "both"]);

export const contentService: ContentService = {
  heroSlides: async (locale) => {
    const now = new Date();
    const rows = await getDb().query.heroSlides.findMany({
      where: (table) =>
        and(
          eq(table.active, true),
          or(isNull(table.startsAt), lte(table.startsAt, now)),
          or(isNull(table.endsAt), gt(table.endsAt, now)),
        ),
      orderBy: (table) => [asc(table.sortOrder), asc(table.createdAt)],
      with: { image: true, mobileImage: true },
    });
    return rows.flatMap((row) => {
      const image = toImage(row.image, locale, pick(row.title, locale));
      if (!image) return [];
      return [
        {
          id: row.id,
          title: pick(row.title, locale),
          subtitle: pick(row.subtitle, locale),
          ctaLabel: pickOrNull(row.ctaLabel, locale),
          ctaHref: row.ctaHref,
          image,
          mobileImage: toImage(row.mobileImage, locale, pick(row.title, locale)),
          tone: row.tone,
        },
      ];
    });
  },
  faqs: async (locale, group) => {
    const rows = await getDb()
      .select()
      .from(faqs)
      .where(and(eq(faqs.published, true), group ? eq(faqs.group, group) : undefined))
      .orderBy(asc(faqs.group), asc(faqs.sortOrder), asc(faqs.createdAt));
    return rows.map((row) => ({
      id: row.id,
      group: row.group,
      question: pick(row.question, locale),
      answer: pick(row.answer, locale),
    }));
  },
  guides: async (locale) => {
    const [rows, categoryRows] = await Promise.all([publishedGuides(), guideCategories()]);
    const index = await mediaIndex(rows.map((row) => row.video?.posterMediaId));
    return rows.map((row) => toGuideListItem(row, categoryRows, index, locale));
  },
  guide: async (locale, slug) => {
    const row = await getDb().query.guides.findFirst({
      where: (table, { and: all, eq: equals }) =>
        all(equals(table.slug, normalizeSlug(slug)), equals(table.published, true)),
    });
    if (!row) return null;
    const categoryRows = await guideCategories();
    const [index, productRows] = await Promise.all([
      mediaIndex(guideMediaIds(row)),
      guideProducts(row.id, categoryRows),
    ]);
    const detail: GuideDetail = {
      ...toGuideListItem(row, categoryRows, index, locale),
      video: toGuideVideo(row, index, locale),
      steps: row.steps.map((step) => ({
        title: pick(step.title, locale),
        body: pick(step.body, locale),
        image: toImage(
          step.mediaId ? index.get(step.mediaId) : null,
          locale,
          pick(step.title, locale),
        ),
      })),
      tools: row.tools.map((tool) => pick(tool, locale)),
      safety: row.safety.map((note) => pick(note, locale)),
      chapters: row.chapters.map((chapter) => ({
        title: pick(chapter.title, locale),
        startSec: chapter.startSec,
      })),
      products: productRows.map((product) => ({
        slug: product.slug,
        name: pick(product.name, locale),
        modelCode: product.modelCode,
      })),
      publishedAt: isoOrNull(row.publishedAt),
      updatedAt: iso(row.updatedAt),
    };
    return detail;
  },
  guideSlugs: async () => (await publishedGuides()).map((row) => row.slug),
  posts: async (locale, query) => {
    const where = query.kind ? eq(posts.kind, query.kind) : undefined;
    const total = await countLivePosts(where);
    const pageCount = Math.max(1, Math.ceil(total / POSTS_PAGE_SIZE));
    const page = Math.min(clampPage(query.page), pageCount);
    const ids = await livePostIds(where, POSTS_PAGE_SIZE, offsetOf(page, POSTS_PAGE_SIZE));
    return toPaginated(await hydratePosts(locale, ids), total, page, POSTS_PAGE_SIZE);
  },
  latestPosts: async (locale, limit) =>
    hydratePosts(locale, await livePostIds(undefined, clampLimit(limit, 3))),
  post: async (locale, slug) => {
    const [row] = await getDb()
      .select({ id: posts.id })
      .from(posts)
      .where(and(isLivePost(), eq(posts.slug, normalizeSlug(slug))));
    if (!row) return null;
    const [full] = await findPostRows([row.id]);
    if (!full) return null;
    const related = full.relatedProductIds.length
      ? await getDb().query.products.findMany({
          where: (table) => inArray(table.id, full.relatedProductIds),
          columns: { id: true },
        })
      : [];
    const visible = related.length
      ? await visibleProductRows(
          inArray(
            products.id,
            related.map((product) => product.id),
          ),
        )
      : [];
    const images = visible.length
      ? await getDb().query.productImages.findMany({
          where: (table) =>
            inArray(
              table.productId,
              visible.map((product) => product.id),
            ),
          orderBy: (table) => [desc(table.isPrimary), asc(table.sortOrder)],
          with: { media: true },
        })
      : [];
    const detail: PostDetail = {
      ...toPostListItem(full, locale),
      body: pick(full.body, locale),
      relatedProducts: orderByIds(full.relatedProductIds, visible).map((product) => {
        const image = images.find((entry) => entry.productId === product.id);
        return {
          slug: product.slug,
          name: pick(product.name, locale),
          modelCode: product.modelCode,
          image: toImage(image?.media, locale, pick(product.name, locale)),
        };
      }),
      seo: toSeo(full.seo, locale),
      updatedAt: iso(full.updatedAt),
    };
    return detail;
  },
  postSlugs: async () => {
    const rows = await getDb()
      .select({ slug: posts.slug })
      .from(posts)
      .where(isLivePost())
      .orderBy(desc(posts.publishedAt));
    return rows.map((row) => row.slug);
  },
  author: async (locale, slug) => {
    const author = await findAuthorWithPosts(slug);
    if (!author) return null;
    return {
      slug: author.slug,
      name: pick(author.name, locale),
      role: pick(author.role, locale),
      avatar: toImage(author.avatar, locale, pick(author.name, locale)),
      bio: pick(author.bio, locale),
      sameAs: author.sameAs,
    };
  },
  authorPosts: async (locale, slug) => {
    const author = await findAuthorWithPosts(slug);
    if (!author) return [];
    return hydratePosts(locale, await livePostIds(eq(posts.authorId, author.id), 100));
  },
  authorSlugs: async () => {
    const rows = await getDb()
      .selectDistinct({ slug: authors.slug })
      .from(authors)
      .innerJoin(posts, eq(posts.authorId, authors.id))
      .where(isLivePost())
      .orderBy(asc(authors.slug));
    return rows.map((row) => row.slug);
  },
  serviceCenters: async (locale, query) => {
    const [rows, categoryRows] = await Promise.all([
      getDb()
        .select()
        .from(serviceCenters)
        .where(
          and(
            eq(serviceCenters.active, true),
            query.province ? eq(serviceCenters.province, query.province) : undefined,
            query.kind ? matchesKind(query.kind) : undefined,
          ),
        )
        .orderBy(asc(serviceCenters.province), asc(serviceCenters.slug)),
      guideCategories(),
    ]);
    return rows.map((row) => ({
      slug: row.slug,
      kind: row.kind,
      name: pick(row.name, locale),
      province: row.province,
      provinceName: provinceName(locale, row.province),
      city: pick(row.city, locale),
      address: pick(row.address, locale),
      phones: row.phones,
      hours: pick(row.hours, locale),
      lat: row.lat,
      lng: row.lng,
      categories: categoryRows
        .filter((category) => row.categoryIds.includes(category.id))
        .map((category) => ({ slug: category.slug, name: pick(category.name, locale) })),
    }));
  },
  provinces: async (locale) => {
    const rows = await getDb()
      .select({ code: serviceCenters.province, total: count() })
      .from(serviceCenters)
      .where(eq(serviceCenters.active, true))
      .groupBy(serviceCenters.province);
    return rows
      .map((row) => ({ code: row.code, name: provinceName(locale, row.code), count: row.total }))
      .toSorted((left, right) => left.name.localeCompare(right.name, locale));
  },
  settings: async (locale) => toSiteSettings(await readSettings(), locale),
};
