import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { PostListItem } from "@/types/content";

import { PostCard } from "./post-card";

interface RelatedPostsProps {
  posts: PostListItem[];
  locale: Locale;
  title: string;
  actionLabel: string;
}

export function RelatedPosts({ posts, locale, title, actionLabel }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="post-related" className="flex flex-col gap-6">
      <SectionHeading
        id="post-related"
        title={title}
        action={
          <Link
            href={localizePath(locale, routes.blog)}
            className="group inline-flex items-center gap-1.5 text-sm font-bold text-primary"
          >
            {actionLabel}
            <ArrowLeft
              className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        }
      />
      <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <RevealItem
            key={post.slug}
            className={index === 2 ? "min-w-0 sm:max-lg:hidden" : "min-w-0"}
          >
            <PostCard post={post} locale={locale} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
