import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductEditor } from "@/features/admin/components/products/product-editor";
import { adminContent } from "@/features/admin/content";
import { requireAdmin } from "@/server/auth/session";
import { idSchema } from "@/server/lib/validation";
import { adminApi } from "@/services/admin";

export async function generateMetadata({
  params,
}: PageProps<"/admin/products/[id]">): Promise<Metadata> {
  const { id } = await params;
  const product = idSchema.safeParse(id).success ? await adminApi.products.get(id) : null;
  return { title: product?.name.fa ?? adminContent.products.title };
}

export default async function AdminProductPage({ params }: PageProps<"/admin/products/[id]">) {
  const { permissions } = await requireAdmin("catalog:read");
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const [product, categories, brands, guides, products] = await Promise.all([
    adminApi.products.get(id),
    adminApi.categories.options(),
    adminApi.brands.options(),
    adminApi.guides.options(),
    adminApi.products.options(),
  ]);
  if (!product) notFound();

  return (
    <ProductEditor
      key={product.updatedAt}
      product={product}
      categories={categories}
      brands={brands}
      guides={guides}
      products={products}
      canWrite={permissions.includes("catalog:write")}
    />
  );
}
