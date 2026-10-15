import "server-only";

import { and, eq, inArray } from "drizzle-orm";
import type { z } from "zod";

import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { getDb } from "@/server/db/client";
import { brands, categories, media, productImages, products } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, ValidationFailure } from "@/server/lib/http-error";
import { revalidateContent } from "@/server/lib/revalidate";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { api } from "@/services";
import { productsAdmin } from "@/services/admin/products";

import type { productImagesSchema, productInputSchema, productPatchSchema } from "./schema";

type ProductRow = typeof products.$inferSelect;

const publicPaths = async (rows: ProductRow[]) => {
  if (rows.length === 0) return [];
  const [categoryRows, brandRows] = await Promise.all([
    getDb()
      .select({ slug: categories.slug })
      .from(categories)
      .where(
        inArray(
          categories.id,
          rows.map((row) => row.categoryId),
        ),
      ),
    getDb()
      .select({ slug: brands.slug })
      .from(brands)
      .where(
        inArray(
          brands.id,
          rows.map((row) => row.brandId),
        ),
      ),
  ]);
  return [
    routes.home,
    routes.products,
    routes.brands,
    routes.compare,
    ...rows.map((row) => routes.product(row.slug)),
    ...categoryRows.map((row) => routes.category(row.slug)),
    ...brandRows.map((row) => routes.brand(row.slug)),
  ];
};

const revalidateProducts = async (rows: ProductRow[]) => {
  revalidateContent([cacheTags.catalog], await publicPaths(rows));
};

const requireProduct = async (id: string) => {
  const [row] = await getDb().select().from(products).where(eq(products.id, id));
  if (!row) throw notFound("Product not found");
  return row;
};

const loadProduct = async (id: string) => {
  const product = await productsAdmin.get(id);
  if (!product) throw notFound("Product not found");
  return product;
};

const assertDownloadMedia = (input: z.output<typeof productPatchSchema>) =>
  assertLibraryMedia(
    Object.fromEntries(
      (input.downloads ?? []).map((download, index) => [
        `downloads.${index}.mediaId`,
        download.mediaId,
      ]),
    ),
  );

const publishedAtFor = (status: ProductRow["status"] | undefined, current: Date | null) =>
  status === "published" && !current ? new Date() : current;

export const createProduct = async (input: z.output<typeof productInputSchema>) => {
  await assertDownloadMedia(input);
  const [row] = await guardWrite(() =>
    getDb()
      .insert(products)
      .values({ ...input, publishedAt: publishedAtFor(input.status, null) })
      .returning(),
  );
  if (!row) throw new Error("Product insert failed");
  await revalidateProducts([row]);
  return loadProduct(row.id);
};

export const updateProduct = async (id: string, patch: z.output<typeof productPatchSchema>) => {
  const before = await requireProduct(id);
  await assertDownloadMedia(patch);
  const [row] = await guardWrite(() =>
    getDb()
      .update(products)
      .set({ ...patch, publishedAt: publishedAtFor(patch.status, before.publishedAt) })
      .where(eq(products.id, id))
      .returning(),
  );
  if (!row) throw notFound("Product not found");
  await revalidateProducts([before, row]);
  return loadProduct(id);
};

export const deleteProduct = async (id: string) => {
  const before = await requireProduct(id);
  await guardDelete(() => getDb().delete(products).where(eq(products.id, id)));
  await revalidateProducts([before]);
  return { id };
};

export const setProductImages = async (id: string, input: z.output<typeof productImagesSchema>) => {
  const product = await requireProduct(id);
  const mediaIds = [...new Set(input.images.map((image) => image.mediaId))];
  const found = mediaIds.length
    ? await getDb()
        .select({ id: media.id })
        .from(media)
        .where(
          and(inArray(media.id, mediaIds), eq(media.kind, "image"), eq(media.scope, "library")),
        )
    : [];
  if (found.length !== mediaIds.length || mediaIds.length !== input.images.length) {
    throw new ValidationFailure({ images: "Each image must be a distinct uploaded image" });
  }
  const primaryIndex = Math.max(
    0,
    input.images.findIndex((image) => image.isPrimary),
  );
  await getDb().transaction(async (tx) => {
    await tx.delete(productImages).where(eq(productImages.productId, id));
    if (input.images.length === 0) return;
    await tx.insert(productImages).values(
      input.images.map((image, index) => ({
        productId: id,
        mediaId: image.mediaId,
        alt: image.alt,
        sortOrder: index,
        isPrimary: index === primaryIndex,
      })),
    );
  });
  await revalidateProducts([product]);
  return (await loadProduct(id)).images;
};

export const lookupProducts = async (locale: Locale, slugs: string[]) => ({
  items: slugs.length > 0 ? await api.catalog.bySlugs(locale, slugs) : [],
});
