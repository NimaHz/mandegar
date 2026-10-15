import { CategorySkeleton } from "@/features/catalog/components/catalog-skeleton";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";

export default async function Loading() {
  const { common } = await getDictionary(await getLocale());
  return <CategorySkeleton label={common.loading} />;
}
