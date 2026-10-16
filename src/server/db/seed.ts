import { getEnv } from "@/config/env";
import { formatWarrantyCode } from "@/lib/warranty-code";
import { closeDb } from "@/server/db/client";
import { isLocalOrigin, isProduction } from "@/server/env";
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

const demoRequested = (localStack: boolean) => {
  const flag = process.env.SEED_DEMO?.trim() ?? "";
  if (flag === "") return localStack;
  if (flag === "true" || flag === "false") return flag === "true";
  throw new Error(`SEED_DEMO must be true, false or empty, got ${flag}`);
};

const seedDemo = async (ownerId: string, localStack: boolean) => {
  const photos = await photoLibrary(photoAlts());
  log(`photos: ${photos.size}`);
  const brandIds = await seedBrands();
  const guideIds = await seedGuides(photos);
  const categoryIds = await seedCategories(photos, guideIds);
  const productIds = await seedProducts(photos, categoryIds, brandIds);
  log(`brands: ${brandIds.size}, categories: ${categoryIds.size}, products: ${productIds.size}`);
  await seedSlides(photos);
  await seedFaqs();
  await seedPosts(photos, productIds);
  await seedServiceCenters(categoryIds);
  if (!localStack) {
    log("warranty codes and tickets: skipped outside a local stack");
    return;
  }
  const codes = await seedWarrantyCodes(productIds);
  log(`warranty codes: ${codes.length}`);
  for (const code of codes.slice(0, 6)) {
    log(`  ${formatWarrantyCode(code.code)}  ${code.product.modelCode} ${code.productionYear}`);
  }
  const tickets = await seedTickets(productIds, ownerId);
  for (const ticket of tickets) log(`  ticket ${ticket.trackingCode} ${ticket.phone}`);
};

const seed = async () => {
  loadEnvFiles();
  const localStack = !isProduction() && isLocalOrigin(getEnv().APP_ORIGIN);
  const demo = demoRequested(localStack);
  const owner = await seedOwner();
  log(`owner: ${owner.email}`);
  await seedPolicies();
  if (demo) await seedDemo(owner.id, localStack);
  else log("demo content: skipped (SEED_DEMO=true loads it)");
  await seedSettings(demo);
  log("seed complete");
};

seed()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
