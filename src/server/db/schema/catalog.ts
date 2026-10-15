import { relations, sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import type {
  LocalizedDownload,
  LocalizedFaq,
  LocalizedFeature,
  LocalizedKeyFact,
  LocalizedSeo,
  LocalizedSpecGroup,
  SpecGroupTemplate,
} from "@/types/admin";
import type { EnergyClass } from "@/types/catalog";

import { foldSearch } from "../search";
import { contentStatus, id, localized, timestamps, timestamptz } from "./columns";
import { guides } from "./content";
import { media } from "./system";

export const brands = pgTable(
  "brands",
  {
    id: id(),
    slug: text().notNull().unique(),
    name: localized(),
    description: localized(),
    logoMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
    website: text(),
    isOwn: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    published: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [index("brands_published_idx").on(table.published, table.sortOrder)],
);

export const categories = pgTable(
  "categories",
  {
    id: id(),
    slug: text().notNull().unique(),
    parentId: uuid().references((): AnyPgColumn => categories.id, { onDelete: "set null" }),
    name: localized(),
    summary: localized(),
    description: localized(),
    icon: text().notNull(),
    imageMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
    defaultGuideId: uuid().references(() => guides.id, { onDelete: "set null" }),
    specTemplate: jsonb().$type<SpecGroupTemplate[]>().notNull().default([]),
    seo: jsonb().$type<LocalizedSeo>(),
    sortOrder: integer().notNull().default(0),
    published: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("categories_parent_idx").on(table.parentId),
    index("categories_published_idx").on(table.published, table.sortOrder),
  ],
);

export const products = pgTable(
  "products",
  {
    id: id(),
    slug: text().notNull().unique(),
    modelCode: text().notNull().unique(),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    brandId: uuid()
      .notNull()
      .references(() => brands.id, { onDelete: "restrict" }),
    status: contentStatus().notNull().default("draft"),
    featured: boolean().notNull().default(false),
    isNew: boolean().notNull().default(false),
    releaseYear: integer(),
    energyClass: text().$type<EnergyClass>(),
    name: localized(),
    tagline: localized(),
    summary: localized(),
    description: localized(),
    specs: jsonb().$type<LocalizedSpecGroup[]>().notNull().default([]),
    keyFacts: jsonb().$type<LocalizedKeyFact[]>().notNull().default([]),
    features: jsonb().$type<LocalizedFeature[]>().notNull().default([]),
    downloads: jsonb().$type<LocalizedDownload[]>().notNull().default([]),
    faqs: jsonb().$type<LocalizedFaq[]>().notNull().default([]),
    guideId: uuid().references(() => guides.id, { onDelete: "set null" }),
    warrantyMonths: integer().notNull().default(18),
    relatedIds: uuid()
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    seo: jsonb().$type<LocalizedSeo>(),
    publishedAt: timestamptz(),
    searchKey: text().generatedAlwaysAs(
      foldSearch(
        sql`model_code || ' ' || (name->>'fa') || ' ' || (name->>'en') || ' ' || (tagline->>'fa') || ' ' || (tagline->>'en')`,
      ),
    ),
    ...timestamps,
  },
  (table) => [
    index("products_status_idx").on(table.status, table.featured),
    index("products_category_idx").on(table.categoryId),
    index("products_brand_idx").on(table.brandId),
    index("products_published_at_idx").on(table.publishedAt),
    index("products_search_trgm_idx").using("gin", table.searchKey.op("gin_trgm_ops")),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: id(),
    productId: uuid()
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    mediaId: uuid()
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    alt: localized(),
    sortOrder: integer().notNull().default(0),
    isPrimary: boolean().notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index("product_images_product_idx").on(table.productId, table.sortOrder),
    uniqueIndex("product_images_primary_idx")
      .on(table.productId)
      .where(sql`is_primary`),
  ],
);

export const brandsRelations = relations(brands, ({ one, many }) => ({
  logo: one(media, { fields: [brands.logoMediaId], references: [media.id] }),
  products: many(products),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "categoryParent",
  }),
  children: many(categories, { relationName: "categoryParent" }),
  image: one(media, { fields: [categories.imageMediaId], references: [media.id] }),
  defaultGuide: one(guides, { fields: [categories.defaultGuideId], references: [guides.id] }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  brand: one(brands, { fields: [products.brandId], references: [brands.id] }),
  guide: one(guides, { fields: [products.guideId], references: [guides.id] }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
  media: one(media, { fields: [productImages.mediaId], references: [media.id] }),
}));
