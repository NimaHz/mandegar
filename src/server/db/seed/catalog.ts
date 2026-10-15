import { eq, inArray, sql } from "drizzle-orm";

import { createWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import {
  brands,
  categories,
  productImages,
  products,
  warrantyCodes,
  warrantyPolicies,
} from "@/server/db/schema";

import { documentMedia, logoMedia } from "./assets";
import {
  type BrandSeed,
  brandSeeds,
  categorySeeds,
  descriptionOf,
  keyFactsOf,
  productSeeds,
} from "./catalog-data";
import { policySeeds } from "./content-data";
import { fromExcluded, idsBySlug, seedId, t, updatableKeys } from "./helpers";

export type IdMap = Map<string, string>;

const logoShapes: Record<
  BrandSeed["logo"]["shape"],
  (primary: string, secondary: string) => string
> = {
  wave: (primary, secondary) =>
    `<clipPath id="c"><circle cx="256" cy="256" r="224"/></clipPath><g clip-path="url(#c)"><path d="M0 0H512V232C448 196 384 196 320 232C256 268 192 268 128 232C64 196 0 196 0 232Z" fill="${primary}"/><path d="M0 284C64 248 128 248 192 284C256 320 320 320 384 284C448 248 512 248 512 284V512H0Z" fill="${secondary}"/></g>`,
  ring: (primary) =>
    `<circle cx="256" cy="256" r="196" fill="none" stroke="${primary}" stroke-width="56"/><circle cx="256" cy="256" r="64" fill="${primary}"/>`,
  square: (primary) =>
    `<rect x="56" y="56" width="400" height="400" rx="88" fill="${primary}"/><rect x="176" y="176" width="160" height="160" rx="32" fill="#ffffff"/>`,
  bolt: (primary) =>
    `<circle cx="256" cy="256" r="224" fill="${primary}"/><path d="M286 88L150 284H246L218 424L362 220H262Z" fill="#ffffff"/>`,
};

const logoSvg = (seed: BrandSeed) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${logoShapes[seed.logo.shape](seed.logo.primary, seed.logo.secondary)}</svg>`;

const required = (map: IdMap, key: string) => {
  const value = map.get(key);
  if (!value) throw new Error(`Missing seeded id for ${key}`);
  return value;
};

export const seedPolicies = async () => {
  const rows = policySeeds.map((seed) => ({
    id: seedId(`policy:${seed.key}`),
    name: seed.name,
    months: seed.months,
    partsMonths: seed.partsMonths,
    startRule: seed.startRule,
    coverage: seed.coverage,
    exclusions: seed.exclusions,
    effectiveFrom: "2024-03-20",
  }));
  const [first] = rows;
  if (!first) return new Map<string, string>();
  await getDb()
    .insert(warrantyPolicies)
    .values(rows)
    .onConflictDoUpdate({ target: warrantyPolicies.id, set: fromExcluded(updatableKeys(first)) });
  return new Map(policySeeds.map((seed) => [seed.key, seedId(`policy:${seed.key}`)]));
};

export const seedBrands = async () => {
  const rows = [];
  for (const seed of brandSeeds) {
    const logo = await logoMedia(logoSvg(seed), seed.name, `logo-${seed.slug}`);
    rows.push({
      id: seedId(`brand:${seed.slug}`),
      slug: seed.slug,
      name: seed.name,
      description: seed.description,
      logoMediaId: logo.id,
      website: seed.website,
      isOwn: seed.isOwn,
      sortOrder: seed.sortOrder,
      seo: seed.metaDescription ? { title: t("", ""), description: seed.metaDescription } : null,
      published: true,
    });
  }
  const [first] = rows;
  if (!first) return new Map<string, string>();
  const saved = await getDb()
    .insert(brands)
    .values(rows)
    .onConflictDoUpdate({ target: brands.slug, set: fromExcluded(updatableKeys(first, ["slug"])) })
    .returning({ id: brands.id, slug: brands.slug });
  return idsBySlug(saved);
};

export const seedCategories = async (photos: IdMap, guideIds: IdMap) => {
  const rows = categorySeeds.map((seed, index) => ({
    id: seedId(`category:${seed.slug}`),
    slug: seed.slug,
    parentId: null,
    name: seed.name,
    summary: seed.summary,
    description: seed.description,
    icon: seed.icon,
    imageMediaId: photos.get(seed.photo) ?? null,
    defaultGuideId: guideIds.get(seed.slug) ?? null,
    specTemplate: seed.specTemplate,
    seo: {
      title: t(
        `${seed.name.fa}: مدل‌ها، مشخصات و راهنمای نصب`,
        `${seed.name.en}: models, specs and guides`,
      ),
      description: seed.summary,
    },
    sortOrder: index,
    published: true,
  }));
  const [first] = rows;
  if (!first) return new Map<string, string>();
  const saved = await getDb()
    .insert(categories)
    .values(rows)
    .onConflictDoUpdate({
      target: categories.slug,
      set: fromExcluded(updatableKeys(first, ["slug"])),
    })
    .returning({ id: categories.id, slug: categories.slug });
  return idsBySlug(saved);
};

const productDownloads = async (seedIndex: number) => {
  const seed = productSeeds[seedIndex];
  if (!seed) return [];
  const manual = await documentMedia(
    [
      `Mandegar ${seed.modelCode}`,
      "User and installation manual",
      "Placeholder document for development",
    ],
    t(`دفترچه راهنمای ${seed.modelCode}`, `${seed.modelCode} user manual`),
    `${seed.slug}-manual`,
  );
  const card = await documentMedia(
    ["Mandegar warranty card", "Placeholder document for development"],
    t("کارت گارانتی ماندگار", "Mandegar warranty card"),
    "warranty-card",
  );
  return [
    { kind: "manual" as const, title: t("دفترچه راهنما", "User manual"), mediaId: manual.id },
    { kind: "warranty-card" as const, title: t("کارت گارانتی", "Warranty card"), mediaId: card.id },
  ];
};

const seedProductImages = async (
  productId: string,
  photoIds: string[],
  name: ReturnType<typeof t>,
) => {
  const [existing] = await getDb()
    .select({ id: productImages.id })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1);
  if (existing || photoIds.length === 0) return;
  await getDb()
    .insert(productImages)
    .values(
      photoIds.map((mediaId, index) => ({
        productId,
        mediaId,
        alt: name,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    );
};

export const seedProducts = async (photos: IdMap, categoryIds: IdMap, brandIds: IdMap) => {
  const now = Date.now();
  const rows = [];
  for (const [index, seed] of productSeeds.entries()) {
    const category = categorySeeds.find((entry) => entry.slug === seed.category);
    if (!category) throw new Error(`Unknown category ${seed.category}`);
    rows.push({
      id: seedId(`product:${seed.slug}`),
      slug: seed.slug,
      modelCode: seed.modelCode,
      categoryId: required(categoryIds, seed.category),
      brandId: required(brandIds, seed.brand),
      status: "published" as const,
      featured: seed.featured,
      isNew: seed.isNew,
      releaseYear: seed.releaseYear,
      energyClass: seed.energyClass,
      name: seed.name,
      tagline: seed.tagline,
      summary: seed.summary,
      description: descriptionOf(seed, category),
      specs: seed.specs,
      keyFacts: keyFactsOf(seed),
      features: seed.features,
      downloads: await productDownloads(index),
      faqs: category.faqs,
      guideId: null,
      warrantyMonths: seed.warrantyMonths,
      seo: null,
      publishedAt: new Date(now - (productSeeds.length - index) * 86_400_000 * 7),
    });
  }
  const [first] = rows;
  if (!first) return new Map<string, string>();
  const saved = await getDb()
    .insert(products)
    .values(rows)
    .onConflictDoUpdate({
      target: products.slug,
      set: fromExcluded(updatableKeys(first, ["slug"])),
    })
    .returning({ id: products.id, slug: products.slug, categoryId: products.categoryId });
  const productIds = idsBySlug(saved);
  for (const seed of productSeeds) {
    const productId = required(productIds, seed.slug);
    const siblings = saved
      .filter(
        (row) => row.slug !== seed.slug && row.categoryId === required(categoryIds, seed.category),
      )
      .map((row) => row.id);
    await getDb().update(products).set({ relatedIds: siblings }).where(eq(products.id, productId));
    await seedProductImages(
      productId,
      seed.photos.flatMap((photo) => photos.get(photo) ?? []),
      seed.name,
    );
  }
  return productIds;
};

export const seedWarrantyCodes = async (productIds: IdMap, policyIds: IdMap) => {
  const rows = productSeeds.flatMap((seed) => {
    const category = categorySeeds.find((entry) => entry.slug === seed.category);
    return [1404, 1405].map((year) => ({
      code: createWarrantyCode(year),
      kind: "batch" as const,
      productId: required(productIds, seed.slug),
      productionYear: year,
      policyId: required(policyIds, category?.policy ?? "care"),
    }));
  });
  await getDb()
    .insert(warrantyCodes)
    .values(rows)
    .onConflictDoNothing({
      target: [warrantyCodes.productId, warrantyCodes.productionYear],
      where: sql`kind = 'batch'`,
    });
  return getDb().query.warrantyCodes.findMany({
    where: (table) => inArray(table.productId, [...productIds.values()]),
    with: { product: { columns: { modelCode: true } } },
    orderBy: (table) => [table.productionYear, table.code],
  });
};
