import {
  and,
  type AnyColumn,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  lte,
  ne,
  or,
  type SQL,
  sql,
} from "drizzle-orm";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { brands, categories, guides, products } from "@/server/db/schema";
import { foldSearch, likePattern, toFoldedKey } from "@/server/db/search";
import { clampPage, offsetOf, toPaginated } from "@/server/lib/pagination";
import { PRODUCT_LOOKUP_LIMIT } from "@/server/modules/products/schema";
import type { LocalizedSpecGroup } from "@/types/admin";
import type {
  BrandDetail,
  BrandSummary,
  CategoryDetail,
  CategorySummary,
  FacetCount,
  ModelOption,
  ProductDetail,
  ProductInsight,
  ProductListItem,
  ProductSort,
  ProductsQuery,
  SearchHit,
  SpecGroup,
} from "@/types/catalog";
import type { LocalizedText } from "@/types/common";

import type { CatalogService } from "../contracts";
import {
  clampLimit,
  effectiveGuideId,
  iso,
  isoOrNull,
  mediaIndex,
  type MediaRow,
  normalizeSlug,
  orderByIds,
  pick,
  toDocument,
  toImage,
  toSeo,
} from "./mappers";

const PAGE_SIZE = 12;
const COMPARE_LIMIT = 4;
const CATEGORY_MEMBERS = 48;

export const visibleProduct = and(
  eq(products.status, "published"),
  eq(categories.published, true),
  eq(brands.published, true),
);

const productScope = (where: SQL | undefined) =>
  getDb()
    .select({ id: products.id })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(visibleProduct, where))
    .$dynamic();

const countProducts = async (where: SQL | undefined) => {
  const [row] = await getDb()
    .select({ total: count() })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(visibleProduct, where));
  return row?.total ?? 0;
};

const publishedFirst = sql`${products.publishedAt} desc nulls last`;

const collatedName: Record<Locale, SQL> = {
  fa: sql`(${products.name}->>'fa') collate "fa-x-icu"`,
  en: sql`(${products.name}->>'en') collate "en-x-icu"`,
};

const sortOrders = (sort: ProductSort, locale: Locale): SQL[] => {
  if (sort === "newest") return [publishedFirst, desc(products.createdAt)];
  if (sort === "name") return [asc(collatedName[locale]), asc(products.modelCode)];
  return [desc(products.featured), publishedFirst, asc(products.modelCode)];
};

const matchesQuery = (q: string) => {
  const key = toFoldedKey(q);
  if (!key) return undefined;
  return or(ilike(products.searchKey, likePattern(key)), sql`${key} <% ${products.searchKey}`);
};

const findListRows = (ids: string[]) =>
  getDb().query.products.findMany({
    where: (table) => inArray(table.id, ids),
    with: {
      category: { columns: { slug: true, name: true } },
      brand: { columns: { slug: true, name: true, isOwn: true } },
      images: {
        orderBy: (image) => [desc(image.isPrimary), asc(image.sortOrder)],
        limit: 1,
        with: { media: true },
      },
    },
  });

type ListRow = Awaited<ReturnType<typeof findListRows>>[number];

const primaryImage = (
  images: { alt: LocalizedText; media: MediaRow }[],
  locale: Locale,
  fallbackAlt: string,
) => {
  const [first] = images;
  return first ? toImage(first.media, locale, pick(first.alt, locale) || fallbackAlt) : null;
};

const toListItem = (row: ListRow, locale: Locale): ProductListItem => {
  const name = pick(row.name, locale);
  return {
    slug: row.slug,
    modelCode: row.modelCode,
    name,
    tagline: pick(row.tagline, locale),
    image: primaryImage(row.images, locale, name),
    category: { slug: row.category.slug, name: pick(row.category.name, locale) },
    brand: { slug: row.brand.slug, name: pick(row.brand.name, locale), isOwn: row.brand.isOwn },
    energyClass: row.energyClass,
    isNew: row.isNew,
    featured: row.featured,
    warrantyMonths: row.warrantyMonths,
  };
};

const hydrateList = async (locale: Locale, ids: string[]) => {
  if (ids.length === 0) return [];
  return orderByIds(ids, await findListRows(ids)).map((row) => toListItem(row, locale));
};

const listProducts = async (
  locale: Locale,
  where: SQL | undefined,
  sort: ProductSort,
  limit: number,
  offset = 0,
) => {
  const rows = await productScope(where)
    .orderBy(...sortOrders(sort, locale))
    .limit(limit)
    .offset(offset);
  return hydrateList(
    locale,
    rows.map((row) => row.id),
  );
};

const publishedCategories = () =>
  getDb().query.categories.findMany({
    where: (table, { eq: equals }) => equals(table.published, true),
    orderBy: (table) => [asc(table.sortOrder), asc(table.slug)],
    with: { image: true },
  });

type CategoryRow = Awaited<ReturnType<typeof publishedCategories>>[number];

const inCategory = (slug: string) => {
  const key = normalizeSlug(slug);
  const root = getDb()
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.slug, key), eq(categories.published, true)));
  return or(eq(categories.slug, key), inArray(categories.parentId, root));
};

const productCounts = async () => {
  const rows = await getDb()
    .select({
      categoryId: products.categoryId,
      brandId: products.brandId,
      energyClass: products.energyClass,
      total: count(),
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(visibleProduct)
    .groupBy(products.categoryId, products.brandId, products.energyClass);
  const tally = (key: (row: (typeof rows)[number]) => string | null) => {
    const totals = new Map<string, number>();
    for (const row of rows) {
      const value = key(row);
      if (value) totals.set(value, (totals.get(value) ?? 0) + row.total);
    }
    return totals;
  };
  return {
    byCategory: tally((row) => row.categoryId),
    byBrand: tally((row) => row.brandId),
    byEnergy: tally((row) => row.energyClass),
  };
};

const rolledUpCount = (rows: CategoryRow[], counts: Map<string, number>, row: CategoryRow) =>
  (counts.get(row.id) ?? 0) +
  rows
    .filter((child) => child.parentId === row.id)
    .reduce((sum, child) => sum + (counts.get(child.id) ?? 0), 0);

const toCategorySummary = (
  rows: CategoryRow[],
  counts: Map<string, number>,
  row: CategoryRow,
  locale: Locale,
): CategorySummary => ({
  slug: row.slug,
  name: pick(row.name, locale),
  summary: pick(row.summary, locale),
  icon: row.icon,
  image: toImage(row.image, locale, pick(row.name, locale)),
  productCount: rolledUpCount(rows, counts, row),
  parentSlug: rows.find((parent) => parent.id === row.parentId)?.slug ?? null,
});

const publishedBrands = () =>
  getDb().query.brands.findMany({
    where: (table, { eq: equals }) => equals(table.published, true),
    orderBy: (table) => [asc(table.sortOrder), asc(table.slug)],
    with: { logo: true },
  });

type BrandRow = Awaited<ReturnType<typeof publishedBrands>>[number];

const toBrandSummary = (
  row: BrandRow,
  counts: Map<string, number>,
  locale: Locale,
): BrandSummary => ({
  slug: row.slug,
  name: pick(row.name, locale),
  logo: toImage(row.logo, locale, pick(row.name, locale)),
  isOwn: row.isOwn,
  productCount: counts.get(row.id) ?? 0,
});

const toSpecGroups = (groups: LocalizedSpecGroup[], locale: Locale): SpecGroup[] =>
  groups.map((group) => ({
    title: pick(group.title, locale),
    items: group.items.map((item) => ({
      key: item.key,
      label: pick(item.label, locale),
      value: pick(item.value, locale),
      numeric: item.numeric,
      unit: item.unit ? pick(item.unit, locale) : null,
      unitCode: item.unitCode,
    })),
  }));

const findProductRow = (slug: string) =>
  getDb().query.products.findFirst({
    where: (table, { and: all, eq: equals }) =>
      all(equals(table.slug, normalizeSlug(slug)), equals(table.status, "published")),
    with: {
      category: { with: { parent: true } },
      brand: true,
      images: {
        orderBy: (image) => [desc(image.isPrimary), asc(image.sortOrder)],
        with: { media: true },
      },
    },
  });

type ProductRow = NonNullable<Awaited<ReturnType<typeof findProductRow>>>;

const resolveGuideSlug = async (row: ProductRow) => {
  const chain = [row.guideId, row.category.defaultGuideId, row.category.parent?.defaultGuideId];
  const candidates = chain.filter((id): id is string => Boolean(id));
  if (candidates.length === 0) return null;
  const rows = await getDb()
    .select({ id: guides.id, slug: guides.slug })
    .from(guides)
    .where(and(inArray(guides.id, candidates), eq(guides.published, true)));
  const id = effectiveGuideId(chain, new Set(rows.map((guide) => guide.id)));
  return rows.find((guide) => guide.id === id)?.slug ?? null;
};

const toProductDetail = async (row: ProductRow, locale: Locale): Promise<ProductDetail> => {
  const documents = await mediaIndex(row.downloads.map((download) => download.mediaId));
  const name = pick(row.name, locale);
  const gallery = row.images.flatMap((image) => {
    const asset = toImage(image.media, locale, pick(image.alt, locale) || name);
    return asset ? [asset] : [];
  });
  return {
    slug: row.slug,
    modelCode: row.modelCode,
    name,
    tagline: pick(row.tagline, locale),
    image: gallery[0] ?? null,
    category: { slug: row.category.slug, name: pick(row.category.name, locale) },
    brand: { slug: row.brand.slug, name: pick(row.brand.name, locale), isOwn: row.brand.isOwn },
    energyClass: row.energyClass,
    isNew: row.isNew,
    featured: row.featured,
    warrantyMonths: row.warrantyMonths,
    summary: pick(row.summary, locale),
    description: pick(row.description, locale),
    gallery,
    keyFacts: row.keyFacts.map((fact) => ({
      label: pick(fact.label, locale),
      value: pick(fact.value, locale),
    })),
    specs: toSpecGroups(row.specs, locale),
    features: row.features.map((feature) => ({
      icon: feature.icon,
      title: pick(feature.title, locale),
      body: pick(feature.body, locale),
    })),
    downloads: row.downloads.flatMap((download) => {
      const file = documents.get(download.mediaId);
      return file
        ? [{ kind: download.kind, title: pick(download.title, locale), file: toDocument(file) }]
        : [];
    }),
    faqs: row.faqs.map((faq) => ({
      question: pick(faq.question, locale),
      answer: pick(faq.answer, locale),
    })),
    guideSlug: await resolveGuideSlug(row),
    releaseYear: row.releaseYear,
    seo: toSeo(row.seo, locale),
    publishedAt: isoOrNull(row.publishedAt),
    updatedAt: iso(row.updatedAt),
  };
};

const loadProduct = async (locale: Locale, slug: string) => {
  const row = await findProductRow(slug);
  if (!row || !row.category.published || !row.brand.published) return null;
  return toProductDetail(row, locale);
};

const relatedProducts = async (locale: Locale, slug: string, limit: number) => {
  if (limit === 0) return [];
  const source = getDb()
    .select({
      sourceId: products.id,
      sourceCategoryId: products.categoryId,
      relatedIds: products.relatedIds,
    })
    .from(products)
    .where(eq(products.slug, normalizeSlug(slug)))
    .as("source");
  const rows = await productScope(
    and(
      ne(products.id, source.sourceId),
      or(
        sql`${products.id} = any(${source.relatedIds})`,
        eq(products.categoryId, source.sourceCategoryId),
      ),
    ),
  )
    .innerJoin(source, sql`true`)
    .orderBy(
      sql`array_position(${source.relatedIds}, ${products.id}) nulls last`,
      desc(products.featured),
      publishedFirst,
    )
    .limit(limit);
  return hydrateList(
    locale,
    rows.map((row) => row.id),
  );
};

const toInsight = (row: InsightRow, locale: Locale): ProductInsight => ({
  slug: row.slug,
  name: pick(row.name, locale),
  modelCode: row.modelCode,
  warrantyMonths: row.warrantyMonths,
  keyFacts: row.keyFacts.map((fact) => ({
    label: pick(fact.label, locale),
    value: pick(fact.value, locale),
  })),
  faqs: row.faqs.map((faq) => ({
    question: pick(faq.question, locale),
    answer: pick(faq.answer, locale),
  })),
});

const insightRows = (locale: Locale, slug: string) =>
  getDb()
    .select({
      slug: products.slug,
      name: products.name,
      modelCode: products.modelCode,
      warrantyMonths: products.warrantyMonths,
      keyFacts: products.keyFacts,
      faqs: products.faqs,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(visibleProduct, inCategory(slug)))
    .orderBy(...sortOrders("featured", locale))
    .limit(CATEGORY_MEMBERS);

type InsightRow = Awaited<ReturnType<typeof insightRows>>[number];

const modelOptions = async (locale: Locale): Promise<ModelOption[]> => {
  const rows = await getDb()
    .select({
      slug: products.slug,
      name: products.name,
      modelCode: products.modelCode,
      category: categories.name,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(visibleProduct);
  return rows
    .map((row) => ({
      slug: row.slug,
      name: pick(row.name, locale),
      modelCode: row.modelCode,
      category: pick(row.category, locale),
    }))
    .toSorted((left, right) => left.modelCode.localeCompare(right.modelCode));
};

export const compareSlugs = (slugs: readonly string[]) =>
  [...new Set(slugs.map(normalizeSlug))].slice(0, COMPARE_LIMIT);

const searchProducts = async (locale: Locale, key: string, limit: number) => {
  const rows = await productScope(matchesQuery(key))
    .orderBy(sql`word_similarity(${key}, ${products.searchKey}) desc`, asc(products.modelCode))
    .limit(limit);
  return hydrateList(
    locale,
    rows.map((row) => row.id),
  );
};

const localizedMatch = (column: AnyColumn, key: string) =>
  sql`${foldSearch(sql`(${column}->>'fa') || ' ' || (${column}->>'en')`)} like ${likePattern(key)}`;

const searchCategories = (key: string, limit: number) =>
  getDb().query.categories.findMany({
    where: (table) => and(eq(table.published, true), localizedMatch(table.name, key)),
    orderBy: (table) => [asc(table.sortOrder)],
    limit,
    with: { image: true },
  });

const searchGuides = (key: string, limit: number) =>
  getDb()
    .select({ slug: guides.slug, title: guides.title, summary: guides.summary })
    .from(guides)
    .where(and(eq(guides.published, true), localizedMatch(guides.title, key)))
    .orderBy(desc(guides.publishedAt))
    .limit(limit);

const searchPosts = (key: string, limit: number) =>
  getDb().query.posts.findMany({
    where: (table) =>
      and(
        eq(table.status, "published"),
        lte(table.publishedAt, new Date()),
        localizedMatch(table.title, key),
      ),
    orderBy: (table) => [desc(table.publishedAt)],
    limit,
    with: { cover: true },
  });

const searchHits = async (locale: Locale, q: string, limit: number): Promise<SearchHit[]> => {
  const key = toFoldedKey(q);
  if (key.length < 2 || limit === 0) return [];
  const [productRows, categoryRows, guideRows, postRows] = await Promise.all([
    searchProducts(locale, key, limit),
    searchCategories(key, limit),
    searchGuides(key, limit),
    searchPosts(key, limit),
  ]);
  const productHits = productRows.map((product): SearchHit => ({
    kind: "product",
    href: localizePath(locale, routes.product(product.slug)),
    title: product.name,
    subtitle: `${product.modelCode} · ${product.category.name}`,
    image: product.image,
  }));
  const categoryHits = categoryRows.map((category): SearchHit => ({
    kind: "category",
    href: localizePath(locale, routes.category(category.slug)),
    title: pick(category.name, locale),
    subtitle: pick(category.summary, locale),
    image: toImage(category.image, locale, pick(category.name, locale)),
  }));
  const guideHits = guideRows.map((guide): SearchHit => ({
    kind: "guide",
    href: localizePath(locale, routes.guide(guide.slug)),
    title: pick(guide.title, locale),
    subtitle: pick(guide.summary, locale),
    image: null,
  }));
  const postHits = postRows.map((post): SearchHit => ({
    kind: "post",
    href: localizePath(locale, routes.post(post.slug)),
    title: pick(post.title, locale),
    subtitle: pick(post.excerpt, locale),
    image: toImage(post.cover, locale, pick(post.title, locale)),
  }));
  const groups = [productHits, categoryHits, guideHits, postHits];
  const quotas = [5, 2, 2, 2];
  const first = groups.flatMap((hits, index) => hits.slice(0, quotas[index]));
  const rest = groups.flatMap((hits, index) => hits.slice(quotas[index]));
  return [...first, ...rest].slice(0, limit);
};

export const catalogService: CatalogService = {
  categories: async (locale) => {
    const [rows, counts] = await Promise.all([publishedCategories(), productCounts()]);
    return rows.map((row) => toCategorySummary(rows, counts.byCategory, row, locale));
  },
  category: async (locale, slug) => {
    const [rows, counts] = await Promise.all([publishedCategories(), productCounts()]);
    const row = rows.find((entry) => entry.slug === normalizeSlug(slug));
    if (!row) return null;
    const detail: CategoryDetail = {
      ...toCategorySummary(rows, counts.byCategory, row, locale),
      description: pick(row.description, locale),
      children: rows
        .filter((child) => child.parentId === row.id)
        .map((child) => toCategorySummary(rows, counts.byCategory, child, locale)),
      seo: toSeo(row.seo, locale),
      updatedAt: iso(row.updatedAt),
    };
    return detail;
  },
  categorySlugs: async () => (await publishedCategories()).map((row) => row.slug),
  products: async (locale, query: ProductsQuery) => {
    const where = and(
      matchesQuery(query.q),
      query.category ? inCategory(query.category) : undefined,
      query.brand ? eq(brands.slug, normalizeSlug(query.brand)) : undefined,
      query.energy ? eq(products.energyClass, query.energy) : undefined,
    );
    const page = clampPage(query.page);
    const pageOf = (target: number) =>
      listProducts(locale, where, query.sort, PAGE_SIZE, offsetOf(target, PAGE_SIZE));
    const [total, items] = await Promise.all([countProducts(where), pageOf(page)]);
    const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page <= pageCount) return toPaginated(items, total, page, PAGE_SIZE);
    return toPaginated(await pageOf(pageCount), total, pageCount, PAGE_SIZE);
  },
  facets: async (locale) => {
    const [categoryRows, brandRows, counts] = await Promise.all([
      publishedCategories(),
      publishedBrands(),
      productCounts(),
    ]);
    const categoryFacets: FacetCount[] = categoryRows
      .map((row) => ({
        value: row.slug,
        label: pick(row.name, locale),
        count: rolledUpCount(categoryRows, counts.byCategory, row),
      }))
      .filter((facet) => facet.count > 0);
    const brandFacets: FacetCount[] = brandRows
      .map((row) => ({
        value: row.slug,
        label: pick(row.name, locale),
        count: counts.byBrand.get(row.id) ?? 0,
      }))
      .filter((facet) => facet.count > 0);
    const energyFacets: FacetCount[] = [...counts.byEnergy]
      .map(([value, total]) => ({ value, label: value, count: total }))
      .toSorted((left, right) => left.value.localeCompare(right.value));
    return { categories: categoryFacets, brands: brandFacets, energyClasses: energyFacets };
  },
  featured: async (locale, limit) =>
    listProducts(locale, eq(products.featured, true), "featured", clampLimit(limit, 8)),
  latest: async (locale, limit) => listProducts(locale, undefined, "newest", clampLimit(limit, 8)),
  byCategory: async (locale, categorySlug, limit) =>
    listProducts(
      locale,
      inCategory(categorySlug),
      "featured",
      clampLimit(limit, CATEGORY_MEMBERS, 200),
    ),
  categoryInsights: async (locale, categorySlug) =>
    (await insightRows(locale, categorySlug)).map((row) => toInsight(row, locale)),
  models: modelOptions,
  bySlugs: async (locale, slugs) => {
    const unique = [...new Set(slugs.map(normalizeSlug))].slice(0, PRODUCT_LOOKUP_LIMIT);
    if (unique.length === 0) return [];
    const rows = await productScope(inArray(products.slug, unique));
    return hydrateList(
      locale,
      rows.map((row) => row.id),
    );
  },
  byBrand: async (locale, brandSlug) =>
    listProducts(locale, eq(brands.slug, normalizeSlug(brandSlug)), "featured", 200),
  product: loadProduct,
  related: async (locale, slug, limit) => relatedProducts(locale, slug, clampLimit(limit, 4, 12)),
  compare: async (locale, slugs) => {
    const details = await Promise.all(compareSlugs(slugs).map((slug) => loadProduct(locale, slug)));
    return details.filter((detail): detail is ProductDetail => detail !== null);
  },
  productSlugs: async () => {
    const rows = await getDb()
      .select({ slug: products.slug })
      .from(products)
      .innerJoin(categories, eq(categories.id, products.categoryId))
      .innerJoin(brands, eq(brands.id, products.brandId))
      .where(visibleProduct)
      .orderBy(asc(products.slug));
    return rows.map((row) => row.slug);
  },
  brands: async (locale) => {
    const [rows, counts] = await Promise.all([publishedBrands(), productCounts()]);
    return rows.map((row) => toBrandSummary(row, counts.byBrand, locale));
  },
  brand: async (locale, slug) => {
    const [rows, counts] = await Promise.all([publishedBrands(), productCounts()]);
    const row = rows.find((entry) => entry.slug === normalizeSlug(slug));
    if (!row) return null;
    const detail: BrandDetail = {
      ...toBrandSummary(row, counts.byBrand, locale),
      description: pick(row.description, locale),
      website: row.website,
      seo: { title: null, description: null },
      updatedAt: iso(row.updatedAt),
    };
    return detail;
  },
  brandSlugs: async () => (await publishedBrands()).map((row) => row.slug),
  search: async (locale, q, limit) => searchHits(locale, q, clampLimit(limit, 8, 20)),
};
