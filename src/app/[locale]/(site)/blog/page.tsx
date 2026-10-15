import { BookOpenText } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHero } from "@/components/layout/page-hero";
import { PendingRegion, TransitionProvider } from "@/components/providers/transition-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { BlogToolbar } from "@/features/blog/components/blog-toolbar";
import { PostListing } from "@/features/blog/components/post-listing";
import { blogContent } from "@/features/blog/content";
import { loadBlogSearchParams, serializeBlogSearchParams } from "@/features/blog/search-params";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { blogGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";
import { postKinds } from "@/types/content";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: PageProps<"/[locale]/blog">): Promise<Metadata> {
  const locale = await getLocale();
  const { kind, page } = await loadBlogSearchParams(searchParams);
  const content = blogContent[locale];
  const { nav } = await getDictionary(locale);
  const parts = [
    kind ? content.kinds[kind].plural : null,
    page > 1 ? fill(content.pageTitle, { page: formatNumber(locale, page) }) : null,
    nav.blog,
  ].filter(Boolean);

  return pageMetadata({
    locale,
    path: `${routes.blog}${serializeBlogSearchParams({ kind, page: page > 1 ? page : null })}`,
    title: parts.join(" · "),
    description: content.metaDescription,
    noindex: Boolean(kind),
  });
}

export default async function BlogPage({ searchParams }: PageProps<"/[locale]/blog">) {
  const locale = await getLocale();
  const filters = await loadBlogSearchParams(searchParams);
  const [{ ui }, result] = await Promise.all([
    getDictionary(locale),
    api.content.posts(locale, { kind: filters.kind, page: filters.page }),
  ]);
  const content = blogContent[locale];
  const blogPath = localizePath(locale, routes.blog);
  const graph = await blogGraph(locale, {
    name: `${content.title} ${content.titleAccent}`,
    description: content.description,
    posts: result.items,
  });

  return (
    <TransitionProvider>
      <JsonLd data={graph} />
      <PageHero
        eyebrow={content.eyebrow}
        title={
          <>
            {content.title} <span className="text-primary">{content.titleAccent}</span>
          </>
        }
        description={content.description}
      />

      <div className="container-page flex flex-col gap-6 pb-16 sm:pb-20">
        <section aria-labelledby="journal-results" className="flex flex-col gap-6">
          <h2 id="journal-results" className="sr-only">
            {content.resultsTitle}
          </h2>
          <BlogToolbar
            label={content.filterLabel}
            options={[
              { value: "all", label: content.allKinds },
              ...postKinds.map((kind) => ({ value: kind, label: content.kinds[kind].plural })),
            ]}
            countLabel={fill(content.count, { count: formatNumber(locale, result.total) })}
          />
          <PendingRegion>
            {result.items.length === 0 ? (
              <EmptyState
                icon={BookOpenText}
                title={content.emptyTitle}
                description={content.emptyDescription}
                action={
                  <Link
                    href={blogPath}
                    className={buttonVariants({ variant: "line", size: "sm", className: "mt-1" })}
                  >
                    {content.emptyAction}
                  </Link>
                }
              />
            ) : (
              <PostListing
                key={serializeBlogSearchParams(filters)}
                posts={result.items}
                locale={locale}
                featured={result.page === 1}
              />
            )}
          </PendingRegion>
          <div className="mt-4">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              locale={locale}
              labels={ui}
              createHref={(page) => ({
                pathname: blogPath,
                search: serializeBlogSearchParams({ ...filters, page: page === 1 ? null : page }),
              })}
            />
          </div>
        </section>
      </div>
    </TransitionProvider>
  );
}
