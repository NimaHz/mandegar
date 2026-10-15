import { formatWarrantyCode } from "@/lib/warranty-code";
import { closeDb } from "@/server/db/client";
import { loadEnvFiles } from "@/server/load-env-files";
import type { LocalizedText } from "@/types/common";

import { photoLibrary } from "./seed/assets";
import {
  seedBrands,
  seedCategories,
  seedPolicies,
  seedProducts,
  seedWarrantyCodes,
} from "./seed/catalog";
import { categorySeeds, productSeeds } from "./seed/catalog-data";
import {
  seedFaqs,
  seedGuides,
  seedPosts,
  seedServiceCenters,
  seedSettings,
  seedSlides,
} from "./seed/content";
import { authorSeeds, guideSeeds, postSeeds, slideSeeds } from "./seed/content-data";
import { seedOwner, seedTickets } from "./seed/support";

const log = (message: string) => process.stdout.write(`${message}\n`);

const photoAlts = () => {
  const alts = new Map<string, LocalizedText>();
  const add = (photo: string | null, alt: LocalizedText) => {
    if (photo && !alts.has(photo)) alts.set(photo, alt);
  };
  for (const seed of productSeeds) for (const photo of seed.photos) add(photo, seed.name);
  for (const seed of categorySeeds) add(seed.photo, seed.name);
  for (const seed of guideSeeds) {
    add(seed.poster, seed.title);
    for (const step of seed.steps) add(step.photo, step.title);
  }
  for (const seed of slideSeeds) add(seed.photo, seed.title);
  for (const seed of authorSeeds) add(seed.photo, seed.name);
  for (const seed of postSeeds) add(seed.photo, seed.title);
  return Object.fromEntries(alts);
};

const seed = async () => {
  loadEnvFiles();
  const owner = await seedOwner();
  log(`owner: ${owner.email}`);
  const photos = await photoLibrary(photoAlts());
  log(`photos: ${photos.size}`);
  const policyIds = await seedPolicies();
  const brandIds = await seedBrands();
  const guideIds = await seedGuides(photos);
  const categoryIds = await seedCategories(photos, guideIds);
  const productIds = await seedProducts(photos, categoryIds, brandIds);
  log(`brands: ${brandIds.size}, categories: ${categoryIds.size}, products: ${productIds.size}`);
  const codes = await seedWarrantyCodes(productIds, policyIds);
  log(`warranty codes: ${codes.length}`);
  for (const code of codes.slice(0, 6)) {
    log(`  ${formatWarrantyCode(code.code)}  ${code.product.modelCode} ${code.productionYear}`);
  }
  await seedSlides(photos);
  await seedFaqs();
  await seedPosts(photos, productIds);
  await seedServiceCenters(categoryIds);
  await seedSettings();
  const tickets = await seedTickets(productIds, owner.id);
  for (const ticket of tickets) log(`  ticket ${ticket.trackingCode} ${ticket.phone}`);
  log("seed complete");
};

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
