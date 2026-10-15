import type { ProductListItem } from "@/types/catalog";

export const toTrayItems = (
  products: Pick<ProductListItem, "slug" | "name" | "modelCode" | "image">[],
) => products.map(({ slug, name, modelCode, image }) => ({ slug, name, modelCode, image }));
