import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { PostListItem } from "@/types/content";

import { AuthorAvatar } from "./author-avatar";
import { CoverArt } from "./cover-art";
import { KindBadge } from "./kind-badge";
import { PostMeta } from "./post-meta";

interface PostCardProps {
  post: PostListItem;
  locale: Locale;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
  className?: string;
}

export const stretchedLink =
  "outline-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset";

export function PostCard({
  post,
  locale,
  headingLevel = "h3",
  priority,
  className,
}: PostCardProps) {
  const Heading = headingLevel;

  return (
    <article
      className={cn(
        "group relative isolate flex h-full card-interactive flex-col overflow-hidden card shadow-card",
        className,
      )}
    >
      <div className="relative">
        <CoverArt
          cover={post.cover}
          kind={post.kind}
          priority={priority}
          sizes="(min-width: 80rem) 25rem, (min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
          className="aspect-[16/10]"
        />
        <KindBadge
          kind={post.kind}
          locale={locale}
          tone="overlay"
          className="absolute start-3 top-3"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <Heading className="line-clamp-2 font-display text-lg leading-[1.6] font-extrabold text-balance text-ink">
          <Link href={localizePath(locale, routes.post(post.slug))} className={stretchedLink}>
            {post.title}
          </Link>
        </Heading>
        <p className="line-clamp-2 text-sm leading-7 text-body">{post.excerpt}</p>
        <div className="mt-auto flex items-center gap-3 border-t border-line pt-4">
          <AuthorAvatar author={post.author} size="sm" />
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-label font-bold text-ink">{post.author.name}</span>
            <PostMeta
              locale={locale}
              publishedAt={post.publishedAt}
              readingMinutes={post.readingMinutes}
            />
          </span>
          <ArrowLeft
            className="ms-auto size-4 shrink-0 text-primary transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
            aria-hidden
          />
        </div>
      </div>
    </article>
  );
}
