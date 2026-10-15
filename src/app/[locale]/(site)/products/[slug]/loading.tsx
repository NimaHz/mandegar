import { ProductSkeleton } from "@/features/product/components/product-skeleton";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export default async function Loading() {
  const { common } = await getDictionary(await getLocale());
  return <ProductSkeleton label={common.loading} />;
}
