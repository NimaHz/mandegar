import { PostSkeleton } from "@/features/blog/components/blog-skeleton";
import { blogContent } from "@/features/blog/content";
import { getLocale } from "@/i18n/get-locale";

export default async function Loading() {
  const locale = await getLocale();
  return <PostSkeleton label={blogContent[locale].loadingPost} />;
}
