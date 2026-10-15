import type { Metadata } from "next";

import { ProductEditor } from "@/features/admin/components/products/product-editor";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { adminApi } from "@/services/admin";

export const metadata: Metadata = { title: adminContent.products.createTitle };

export default async function AdminNewProductPage() {
  await requireAdmin("catalog:write");
  const [categories, brands, guides, products] = await Promise.all([
    adminApi.categories.options(),
    adminApi.brands.options(),
    adminApi.guides.options(),
    adminApi.products.options(),
  ]);

  return (
    <ProductEditor
      product={null}
      categories={categories}
      brands={brands}
      guides={guides}
      products={products}
      canWrite
    />
  );
}
