import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { Markdown } from "@/components/shared/markdown";
import { splitTakeaways, tocHeadings } from "@/features/blog/article";
import { AuthorBio } from "@/features/blog/components/author-bio";
import { KeyTakeaways } from "@/features/blog/components/key-takeaways";
import { PostHeader } from "@/features/blog/components/post-header";
import { PostShare } from "@/features/blog/components/post-share";
import { PostToc } from "@/features/blog/components/post-toc";
import { RelatedPosts } from "@/features/blog/components/related-posts";
import { RelatedProducts } from "@/features/blog/components/related-products";
import { blogContent } from "@/features/blog/content";
import { findRelatedPosts, getAuthor, getPost } from "@/features/blog/query";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { postGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { ogEntityTarget } from "@/lib/seo/og/cards";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await api.content.postSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/blog/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) notFound();

  return pageMetadata({
    locale,
    path: routes.post(post.slug),
    og: await ogEntityTarget(locale, "post", post.slug),
    title: post.seo.title ?? post.title,
    description: post.seo.description ?? post.excerpt,
    image: post.cover && {
      url: post.cover.src,
      width: post.cover.width || undefined,
      height: post.cover.height || undefined,
      alt: post.cover.alt,
    },
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
  });
}

export default async function PostPage({ params }: PageProps<"/[locale]/blog/[slug]">) {
  const locale = await getLocale();
  const { slug } = await params;
  const post = await getPost(locale, slug);
  if (!post) notFound();

  const [dictionary, author, related] = await Promise.all([
    getDictionary(locale),
    getAuthor(locale, post.author.slug),
    findRelatedPosts(locale, post),
  ]);
  const content = blogContent[locale];
  const { takeaways, body } = splitTakeaways(post.body);
  const headings = tocHeadings(body);
  const graph = await postGraph(locale, {
    post,
    author,
    section: content.kinds[post.kind].plural,
    breadcrumbs: [
      { label: dictionary.nav.home, href: localizePath(locale, routes.home) },
      { label: dictionary.nav.blog, href: localizePath(locale, routes.blog) },
      { label: post.title },
    ],
  });

  return (
    <div className="flex flex-col gap-16 pb-16 sm:gap-20 sm:pb-20">
      <JsonLd data={graph} />
      <article className="container-page flex flex-col gap-8 pt-6 sm:gap-10 sm:pt-10">
        <PostHeader post={post} locale={locale} dictionary={dictionary} />

        {post.cover && (
          <figure className="relative aspect-[16/10] animate-fade overflow-hidden rounded-panel border border-line bg-sunken shadow-card sm:aspect-[16/9] lg:aspect-[21/9]">
            <Image
              src={post.cover.src}
              alt={post.cover.alt}
              fill
              sizes="(min-width: 80rem) 76rem, 100vw"
              loading="eager"
              fetchPriority="high"
              className="object-cover"
            />
          </figure>
        )}

        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_18rem]">
          {headings.length > 1 && (
            <div className="lg:sticky lg:top-28 lg:order-last">
              <PostToc
                headings={headings}
                label={content.toc}
                showLabel={content.tocShow}
                hideLabel={content.tocHide}
              />
            </div>
          )}
          <div className="flex max-w-3xl min-w-0 flex-col gap-10">
            {takeaways && <KeyTakeaways takeaways={takeaways} />}
            <Markdown source={body} className="sm:text-[1.0625rem] sm:leading-[2.1]" />
            <div className="flex flex-col gap-4 rounded-card bg-sunken p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-bold text-ink">{content.shareTitle}</p>
              <PostShare
                title={post.title}
                labels={{
                  copy: content.shareCopy,
                  copied: content.shareCopied,
                  failed: content.shareFailed,
                  share: content.shareNative,
                }}
              />
            </div>
            <AuthorBio author={author ?? post.author} locale={locale} />
          </div>
        </div>
      </article>

      {post.relatedProducts.length > 0 && (
        <div className="container-page">
          <RelatedProducts products={post.relatedProducts} locale={locale} />
        </div>
      )}

      {related.length > 0 && (
        <div className="border-t border-line bg-surface pt-12 pb-4 sm:pt-16">
          <div className="container-page">
            <RelatedPosts
              posts={related}
              locale={locale}
              title={content.relatedPosts}
              actionLabel={content.allPosts}
            />
          </div>
        </div>
      )}
    </div>
  );
}
