import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import type { Locale } from "@/i18n/config";
import type { PostListItem } from "@/types/content";

import { blogContent } from "../content";
import { FeaturedPost } from "./featured-post";
import { PostCard } from "./post-card";

interface PostListingProps {
  posts: PostListItem[];
  locale: Locale;
  featured: boolean;
}

function PostGrid({ posts, locale }: Omit<PostListingProps, "featured">) {
  if (posts.length === 0) return null;

  return (
    <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <RevealItem key={post.slug} className="min-w-0">
          <PostCard post={post} locale={locale} />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}

export function PostListing({ posts, locale, featured }: PostListingProps) {
  const [lead, ...rest] = posts;
  if (!featured || !lead) return <PostGrid posts={posts} locale={locale} />;

  const stacked = rest.length >= 2;
  const side = stacked ? rest.slice(0, 2) : [];
  const grid = stacked ? rest.slice(2) : rest;

  return (
    <div className="flex flex-col gap-5">
      <section aria-label={blogContent[locale].featuredTitle}>
        {stacked ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <FeaturedPost post={lead} locale={locale} />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1 lg:grid-rows-2">
              {side.map((post) => (
                <PostCard key={post.slug} post={post} locale={locale} priority />
              ))}
            </div>
          </div>
        ) : (
          <FeaturedPost post={lead} locale={locale} layout="wide" />
        )}
      </section>
      <PostGrid posts={grid} locale={locale} />
    </div>
  );
}
