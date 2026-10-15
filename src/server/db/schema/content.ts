import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import type {
  GuideVideoSource,
  LocalizedChapter,
  LocalizedGuideStep,
  LocalizedSeo,
} from "@/types/admin";
import { slideTones } from "@/types/admin";
import type { LocalizedText } from "@/types/common";
import { faqGroups, postKinds, serviceCenterKinds } from "@/types/content";

import { contentStatus, id, localized, localizedList, timestamps, timestamptz } from "./columns";
import { media } from "./system";

export const slideTone = pgEnum("slide_tone", slideTones);
export const faqGroup = pgEnum("faq_group", faqGroups);
export const postKind = pgEnum("post_kind", postKinds);
export const serviceCenterKind = pgEnum("service_center_kind", serviceCenterKinds);

export const guides = pgTable(
  "guides",
  {
    id: id(),
    slug: text().notNull().unique(),
    title: localized(),
    summary: localized(),
    video: jsonb().$type<GuideVideoSource>(),
    durationSec: integer(),
    steps: jsonb().$type<LocalizedGuideStep[]>().notNull().default([]),
    tools: localizedList(),
    safety: localizedList(),
    chapters: jsonb().$type<LocalizedChapter[]>().notNull().default([]),
    published: boolean().notNull().default(false),
    publishedAt: timestamptz(),
    ...timestamps,
  },
  (table) => [index("guides_published_idx").on(table.published, table.publishedAt)],
);

export const heroSlides = pgTable(
  "hero_slides",
  {
    id: id(),
    title: localized(),
    subtitle: localized(),
    ctaLabel: jsonb().$type<LocalizedText>(),
    ctaHref: text(),
    imageMediaId: uuid()
      .notNull()
      .references(() => media.id, { onDelete: "restrict" }),
    mobileImageMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
    tone: slideTone().notNull().default("dark"),
    sortOrder: integer().notNull().default(0),
    active: boolean().notNull().default(true),
    startsAt: timestamptz(),
    endsAt: timestamptz(),
    ...timestamps,
  },
  (table) => [index("hero_slides_active_idx").on(table.active, table.sortOrder)],
);

export const faqs = pgTable(
  "faqs",
  {
    id: id(),
    group: faqGroup().notNull(),
    question: localized(),
    answer: localized(),
    sortOrder: integer().notNull().default(0),
    published: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [index("faqs_group_idx").on(table.group, table.published, table.sortOrder)],
);

export const authors = pgTable("authors", {
  id: id(),
  slug: text().notNull().unique(),
  name: localized(),
  role: localized(),
  bio: localized(),
  avatarMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
  sameAs: text()
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  ...timestamps,
});

export const posts = pgTable(
  "posts",
  {
    id: id(),
    slug: text().notNull().unique(),
    kind: postKind().notNull(),
    title: localized(),
    excerpt: localized(),
    body: localized(),
    coverMediaId: uuid().references(() => media.id, { onDelete: "set null" }),
    authorId: uuid()
      .notNull()
      .references(() => authors.id, { onDelete: "restrict" }),
    relatedProductIds: uuid()
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    status: contentStatus().notNull().default("draft"),
    seo: jsonb().$type<LocalizedSeo>(),
    publishedAt: timestamptz(),
    ...timestamps,
  },
  (table) => [
    index("posts_status_idx").on(table.status, table.publishedAt),
    index("posts_author_idx").on(table.authorId),
    index("posts_kind_idx").on(table.kind),
  ],
);

export const serviceCenters = pgTable(
  "service_centers",
  {
    id: id(),
    slug: text().notNull().unique(),
    kind: serviceCenterKind().notNull(),
    name: localized(),
    province: text().notNull(),
    city: localized(),
    address: localized(),
    phones: text()
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    hours: localized(),
    lat: numeric({ precision: 9, scale: 6, mode: "number" }),
    lng: numeric({ precision: 9, scale: 6, mode: "number" }),
    categoryIds: uuid()
      .array()
      .notNull()
      .default(sql`'{}'::uuid[]`),
    active: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [index("service_centers_province_idx").on(table.active, table.province)],
);

export const heroSlidesRelations = relations(heroSlides, ({ one }) => ({
  image: one(media, { fields: [heroSlides.imageMediaId], references: [media.id] }),
  mobileImage: one(media, { fields: [heroSlides.mobileImageMediaId], references: [media.id] }),
}));

export const authorsRelations = relations(authors, ({ one, many }) => ({
  avatar: one(media, { fields: [authors.avatarMediaId], references: [media.id] }),
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(authors, { fields: [posts.authorId], references: [authors.id] }),
  cover: one(media, { fields: [posts.coverMediaId], references: [media.id] }),
}));
