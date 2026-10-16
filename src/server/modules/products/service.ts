import "server-only";

import { and, arrayContains, eq, inArray, type SQL, sql } from "drizzle-orm";
import type { z } from "zod";

import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import { type Executor, getDb } from "@/server/db/client";
import { brands, categories, media, posts, productImages, products } from "@/server/db/schema";
import { cacheTags } from "@/server/lib/cache-tags";
import { assertUnchanged } from "@/server/lib/concurrency";
import { guardDelete, guardWrite } from "@/server/lib/db-errors";
import { notFound, ValidationFailure } from "@/server/lib/http-error";
import { publishedAtFor } from "@/server/lib/published-at";
import { revalidateContent } from "@/server/lib/revalidate";
import { assertLibraryMedia } from "@/server/modules/media/service";
import { api } from "@/services";
import { productsAdmin } from "@/services/admin/products";

import type { productImagesSchema, productInputSchema, productPatchSchema } from "./schema";

type ProductRow = typeof products.$inferSelect;

type ImageInput = z.output<typeof productImagesSchema>["images"];

const publicPaths = async (rows: ProductRow[]) => {
  const published = rows.filter((row) => row.status === "published");
  if (published.length === 0) return [];
  const [categoryRows, brandRows] = await Promise.all([
    getDb()
      .select({ id: categories.id, slug: categories.slug })
      .from(categories)
      .where(
        and(
          inArray(
            categories.id,
            published.map((row) => row.categoryId),
          ),
          eq(categories.published, true),
        ),
      ),
    getDb()
      .select({ id: brands.id, slug: brands.slug })
      .from(brands)
      .where(
        and(
          inArray(
            brands.id,
            published.map((row) => row.brandId),
          ),
          eq(brands.published, true),
        ),
      ),
  ]);
  const visible = published.filter(
    (row) =>
      categoryRows.some((category) => category.id === row.categoryId) &&
      brandRows.some((brand) => brand.id === row.brandId),
  );
  if (visible.length === 0) return [];
  return [
    routes.home,
    routes.products,
    routes.brands,
    ...visible.map((row) => routes.product(row.slug)),
    ...categoryRows
      .filter((category) => visible.some((row) => row.categoryId === category.id))
      .map((category) => routes.category(category.slug)),
    ...brandRows
      .filter((brand) => visible.some((row) => row.brandId === brand.id))
      .map((brand) => routes.brand(brand.slug)),
  ];
};

const listedProductPaths = async (where: SQL | undefined) => {
  const rows = await getDb()
    .select({ slug: products.slug })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(eq(products.status, "published"), where));
  return rows.map((row) => routes.product(row.slug));
};

interface ListingState {
  slug: string;
  published: boolean;
}

interface ListingRoutes {
  index: string;
  path: (slug: string) => string;
  members: SQL | undefined;
}

export const revalidateListing = async (
  states: ListingState[],
  { index, path, members }: ListingRoutes,
) => {
  const listed = states.filter((state) => state.published);
  if (listed.length === 0) {
    revalidateContent([cacheTags.catalog]);
    return;
  }
  const [first] = states;
  const moved = states.some(
    (state) => state.slug !== first?.slug || state.published !== first.published,
  );
  revalidateContent(
    [cacheTags.catalog],
    [
      routes.home,
      index,
      ...listed.map((state) => path(state.slug)),
      ...(moved ? await listedProductPaths(members) : []),
    ],
  );
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
    "document",
  );

const lockProduct = async (tx: Executor, id: string) => {
  const [row] = await tx.select().from(products).where(eq(products.id, id)).for("update");
  if (!row) throw notFound("Product not found");
  return row;
};

const writeImages = async (tx: Executor, id: string, images: ImageInput) => {
  const mediaIds = [...new Set(images.map((image) => image.mediaId))];
  const found =
    mediaIds.length === images.length && mediaIds.length > 0
      ? await tx
          .select({ id: media.id })
          .from(media)
          .where(
            and(inArray(media.id, mediaIds), eq(media.kind, "image"), eq(media.scope, "library")),
          )
          .for("share")
      : [];
  if (mediaIds.length !== images.length || found.length !== mediaIds.length) {
    throw new ValidationFailure({ images: "Each image must be a distinct uploaded image" });
  }
  const primaryIndex = Math.max(
    0,
    images.findIndex((image) => image.isPrimary),
  );
  await tx.delete(productImages).where(eq(productImages.productId, id));
  if (images.length > 0) {
    await tx.insert(productImages).values(
      images.map((image, index) => ({
        productId: id,
        mediaId: image.mediaId,
        alt: image.alt,
        sortOrder: index,
        isPrimary: index === primaryIndex,
      })),
    );
  }
};

export const createProduct = async ({
  images = [],
  ...input
}: z.output<typeof productInputSchema>) => {
  await assertDownloadMedia(input);
  const row = await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const [inserted] = await tx
        .insert(products)
        .values({ ...input, publishedAt: publishedAtFor(input.status === "published", null) })
        .returning();
      if (!inserted) throw new Error("Product insert failed");
      await writeImages(tx, inserted.id, images);
      return inserted;
    }),
  );
  await revalidateProducts([row]);
  return loadProduct(row.id);
};

export const updateProduct = async (
  id: string,
  { expectedUpdatedAt, images, ...patch }: z.output<typeof productPatchSchema>,
) => {
  await assertDownloadMedia(patch);
  const [before, row] = await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const current = await lockProduct(tx, id);
      assertUnchanged(current.updatedAt, expectedUpdatedAt);
      const [updated] = await tx
        .update(products)
        .set({
          ...patch,
          publishedAt: publishedAtFor(
            (patch.status ?? current.status) === "published",
            current.publishedAt,
          ),
        })
        .where(eq(products.id, id))
        .returning();
      if (!updated) throw notFound("Product not found");
      if (images) await writeImages(tx, id, images);
      return [current, updated] as const;
    }),
  );
  await revalidateProducts([before, row]);
  return loadProduct(id);
};

export const deleteProduct = async (id: string) => {
  const before = await requireProduct(id);
  await guardDelete(() =>
    getDb().transaction(async (tx) => {
      await tx.delete(products).where(eq(products.id, id));
      await tx
        .update(products)
        .set({ relatedIds: sql`array_remove(${products.relatedIds}, ${id}::uuid)` })
        .where(arrayContains(products.relatedIds, [id]));
      await tx
        .update(posts)
        .set({ relatedProductIds: sql`array_remove(${posts.relatedProductIds}, ${id}::uuid)` })
        .where(arrayContains(posts.relatedProductIds, [id]));
    }),
  );
  await revalidateProducts([before]);
  return { id };
};

export const setProductImages = async (id: string, input: z.output<typeof productImagesSchema>) => {
  const product = await guardWrite(() =>
    getDb().transaction(async (tx) => {
      const row = await lockProduct(tx, id);
      await writeImages(tx, id, input.images);
      await tx.update(products).set({ updatedAt: new Date() }).where(eq(products.id, id));
      return row;
    }),
  );
  await revalidateProducts([product]);
  return (await loadProduct(id)).images;
};

export const lookupProducts = async (locale: Locale, slugs: string[]) => ({
  items: slugs.length > 0 ? await api.catalog.bySlugs(locale, slugs) : [],
});
