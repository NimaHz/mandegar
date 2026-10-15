import { getDb } from "@/server/db/client";
import {
  authors,
  faqs,
  guides,
  heroSlides,
  posts,
  serviceCenters,
  settings,
} from "@/server/db/schema";
import { settingKeys } from "@/types/admin";

import type { IdMap } from "./catalog";
import { categorySeeds, productSeeds } from "./catalog-data";
import {
  authorSeeds,
  faqSeeds,
  guideSeeds,
  postSeeds,
  serviceCenterSeeds,
  settingsSeed,
  slideSeeds,
} from "./content-data";
import { fromExcluded, seedId, updatableKeys } from "./helpers";

const idsBySlug = (rows: { id: string; slug: string }[]): IdMap =>
  new Map(rows.map((row) => [row.slug, row.id]));

export const seedGuides = async (photos: IdMap) => {
  const now = Date.now();
  const rows = guideSeeds.map((seed, index) => ({
    id: seedId(`guide:${seed.slug}`),
    slug: seed.slug,
    title: seed.title,
    summary: seed.summary,
    video: {
      kind: "aparat" as const,
      hash: seed.aparatHash,
      posterMediaId: photos.get(seed.poster) ?? null,
    },
    durationSec: seed.durationSec,
    steps: seed.steps.map((step) => ({
      title: step.title,
      body: step.body,
      mediaId: step.photo ? (photos.get(step.photo) ?? null) : null,
    })),
    tools: seed.tools,
    safety: seed.safety,
    chapters: seed.chapters,
    published: true,
    publishedAt: new Date(now - (index + 1) * 86_400_000 * 20),
  }));
  const [first] = rows;
  if (!first) return new Map<string, string>();
  const saved = await getDb()
    .insert(guides)
    .values(rows)
    .onConflictDoUpdate({ target: guides.slug, set: fromExcluded(updatableKeys(first, ["slug"])) })
    .returning({ id: guides.id, slug: guides.slug });
  const guideIds = idsBySlug(saved);
  return new Map(
    guideSeeds.flatMap((seed) => {
      const id = guideIds.get(seed.slug);
      return id ? [[seed.category, id] as const] : [];
    }),
  );
};

export const seedSlides = async (photos: IdMap) => {
  const rows = slideSeeds.flatMap((seed, index) => {
    const imageMediaId = photos.get(seed.photo);
    if (!imageMediaId) return [];
    return [
      {
        id: seedId(`slide:${seed.key}`),
        title: seed.title,
        subtitle: seed.subtitle,
        ctaLabel: seed.ctaLabel,
        ctaHref: seed.ctaHref,
        imageMediaId,
        mobileImageMediaId: null,
        tone: seed.tone,
        sortOrder: index,
        active: true,
        startsAt: null,
        endsAt: null,
      },
    ];
  });
  const [first] = rows;
  if (!first) return;
  await getDb()
    .insert(heroSlides)
    .values(rows)
    .onConflictDoUpdate({ target: heroSlides.id, set: fromExcluded(updatableKeys(first)) });
};

export const seedFaqs = async () => {
  const rows = faqSeeds.map((seed, index) => ({
    id: seedId(`faq:${seed.key}`),
    group: seed.group,
    question: seed.question,
    answer: seed.answer,
    sortOrder: index,
    published: true,
  }));
  const [first] = rows;
  if (!first) return;
  await getDb()
    .insert(faqs)
    .values(rows)
    .onConflictDoUpdate({ target: faqs.id, set: fromExcluded(updatableKeys(first)) });
};

export const seedPosts = async (photos: IdMap, productIds: IdMap) => {
  const authorRows = authorSeeds.map((seed) => ({
    id: seedId(`author:${seed.slug}`),
    slug: seed.slug,
    name: seed.name,
    role: seed.role,
    bio: seed.bio,
    avatarMediaId: photos.get(seed.photo) ?? null,
    sameAs: [],
  }));
  const [firstAuthor] = authorRows;
  if (!firstAuthor) return;
  const savedAuthors = await getDb()
    .insert(authors)
    .values(authorRows)
    .onConflictDoUpdate({
      target: authors.slug,
      set: fromExcluded(updatableKeys(firstAuthor, ["slug"])),
    })
    .returning({ id: authors.id, slug: authors.slug });
  const authorIds = idsBySlug(savedAuthors);
  const now = Date.now();
  const postRows = postSeeds.flatMap((seed) => {
    const authorId = authorIds.get(seed.author);
    if (!authorId) return [];
    return [
      {
        id: seedId(`post:${seed.slug}`),
        slug: seed.slug,
        kind: seed.kind,
        title: seed.title,
        excerpt: seed.excerpt,
        body: seed.body,
        coverMediaId: photos.get(seed.photo) ?? null,
        authorId,
        relatedProductIds: seed.related.flatMap((slug) => productIds.get(slug) ?? []),
        status: "published" as const,
        seo: null,
        publishedAt: new Date(now - seed.daysAgo * 86_400_000),
      },
    ];
  });
  const [firstPost] = postRows;
  if (!firstPost) return;
  await getDb()
    .insert(posts)
    .values(postRows)
    .onConflictDoUpdate({
      target: posts.slug,
      set: fromExcluded(updatableKeys(firstPost, ["slug"])),
    });
};

export const seedServiceCenters = async (categoryIds: IdMap) => {
  const allCategories = categorySeeds.flatMap((seed) => categoryIds.get(seed.slug) ?? []);
  const rows = serviceCenterSeeds.map((seed, index) => ({
    id: seedId(`center:${seed.slug}`),
    slug: seed.slug,
    kind: seed.kind,
    name: seed.name,
    province: seed.province,
    city: seed.city,
    address: seed.address,
    phones: [
      `+98 ${String(index + 10).padStart(2, "0")} 0000 ${String(index + 100).padStart(4, "0")}`,
    ],
    hours: {
      fa: "شنبه تا چهارشنبه ۹ تا ۱۸، پنجشنبه ۹ تا ۱۳",
      en: "Saturday to Wednesday 9:00–18:00, Thursday 9:00–13:00",
    },
    lat: seed.lat,
    lng: seed.lng,
    categoryIds:
      seed.categories === "all"
        ? allCategories
        : seed.categories.flatMap((slug) => categoryIds.get(slug) ?? []),
    active: true,
  }));
  const [first] = rows;
  if (!first) return;
  await getDb()
    .insert(serviceCenters)
    .values(rows)
    .onConflictDoUpdate({
      target: serviceCenters.slug,
      set: fromExcluded(updatableKeys(first, ["slug"])),
    });
};

export const seedSettings = async () => {
  const values = settingsSeed(productSeeds.length, serviceCenterSeeds.length);
  await getDb()
    .insert(settings)
    .values(settingKeys.map((key) => ({ key, value: values[key] })))
    .onConflictDoNothing({ target: settings.key });
};
