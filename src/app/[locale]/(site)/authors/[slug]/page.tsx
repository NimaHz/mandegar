import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { AuthorProfile } from "@/features/blog/components/author-profile";
import { PostCard } from "@/features/blog/components/post-card";
import { blogContent } from "@/features/blog/content";
import { getAuthor } from "@/features/blog/query";
import { fill } from "@/i18n/fill";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { authorGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await api.content.authorSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/authors/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const author = await getAuthor(locale, slug);
  if (!author) notFound();

  return pageMetadata({
    locale,
    path: routes.author(author.slug),
    og: { kind: "author", slug: author.slug },
    title: author.name,
    description: fill(blogContent[locale].authorMetaDescription, {
      name: author.name,
      role: author.role,
    }),
    image: author.avatar && { url: author.avatar.src, alt: author.name },
    type: "profile",
  });
}

export default async function AuthorPage({ params }: PageProps<"/[locale]/authors/[slug]">) {
  const locale = await getLocale();
  const { slug } = await params;
  const [author, posts, { nav, ui }] = await Promise.all([
    getAuthor(locale, slug),
    api.content.authorPosts(locale, slug),
    getDictionary(locale),
  ]);
  if (!author) notFound();
  const content = blogContent[locale];
  const breadcrumbs = [
    { label: nav.home, href: localizePath(locale, routes.home) },
    { label: nav.blog, href: localizePath(locale, routes.blog) },
    { label: author.name },
  ];
  const graph = await authorGraph(locale, { author, posts, breadcrumbs });

  return (
    <div className="container-page flex flex-col gap-10 pt-6 pb-16 sm:gap-14 sm:pt-10 sm:pb-20">
      <JsonLd data={graph} />
      <div className="flex flex-col gap-6">
        <Breadcrumbs label={ui.breadcrumbsLabel} items={breadcrumbs} />
        <AuthorProfile author={author} locale={locale} postCount={posts.length} />
      </div>

      {posts.length > 0 && (
        <section aria-labelledby="author-posts" className="flex flex-col gap-6">
          <h2
            id="author-posts"
            className="font-display text-[1.625rem] leading-snug font-black text-ink sm:text-[2rem]"
          >
            {fill(content.authorPosts, { name: author.name })}
          </h2>
          <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <RevealItem key={post.slug} className="min-w-0">
                <PostCard post={post} locale={locale} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>
      )}
    </div>
  );
}
