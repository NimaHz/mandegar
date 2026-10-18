import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import { ModelCodeText } from "@/components/shared/model-code-text";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { FULL_WIDTH_SIZES } from "@/lib/image";
import { routes } from "@/lib/routes";
import type { PostListItem } from "@/types/content";

import { blogContent } from "../content";
import { AuthorAvatar } from "./author-avatar";
import { CoverArt } from "./cover-art";
import { KindBadge } from "./kind-badge";
import { stretchedLink } from "./post-card";
import { PostMeta } from "./post-meta";

interface FeaturedPostProps {
  post: PostListItem;
  locale: Locale;
  layout?: "tall" | "wide";
}

export function FeaturedPost({ post, locale, layout = "tall" }: FeaturedPostProps) {
  const content = blogContent[locale];
  const wide = layout === "wide";

  return (
    <article
      className={cn(
        "group relative isolate grid h-full card-interactive overflow-hidden panel shadow-card",
        wide
          ? "md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"
          : "grid-rows-[auto_auto] lg:grid-rows-[minmax(16rem,1fr)_auto]",
      )}
    >
      <CoverArt
        cover={post.cover}
        kind={post.kind}
        priority
        sizes={
          wide
            ? `(min-width: 80rem) 42rem, (min-width: 48rem) 55vw, ${FULL_WIDTH_SIZES}`
            : `(min-width: 80rem) 50rem, (min-width: 64rem) 66vw, ${FULL_WIDTH_SIZES}`
        }
        className={cn("aspect-[16/10]", wide ? "md:aspect-auto md:min-h-96" : "lg:aspect-auto")}
      />
      <div className="flex flex-col gap-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge size="sm" tone="solid">
            <Sparkles aria-hidden />
            {content.featuredBadge}
          </Badge>
          <KindBadge kind={post.kind} locale={locale} />
        </div>
        <h2 className="font-display text-[1.5rem] leading-[1.5] font-black text-balance text-ink sm:text-[1.875rem]">
          <Link href={localizePath(locale, routes.post(post.slug))} className={stretchedLink}>
            <ModelCodeText text={post.title} />
          </Link>
        </h2>
        <p className="line-clamp-3 max-w-2xl text-lead leading-8 text-pretty text-body">
          {post.excerpt}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <span className="flex min-w-0 items-center gap-3">
            <AuthorAvatar author={post.author} size="md" />
            <span className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm font-extrabold text-ink">{post.author.name}</span>
              <PostMeta
                locale={locale}
                publishedAt={post.publishedAt}
                readingMinutes={post.readingMinutes}
              />
            </span>
          </span>
          <span
            aria-hidden
            className="inline-flex h-10 items-center gap-2 rounded-control bg-primary px-4 text-label font-bold text-on-primary transition-[background-color,box-shadow] duration-300 group-hover:bg-primary-strong group-hover:shadow-primary"
          >
            {content.readArticle}
            <ArrowLeft className="size-4 ltr:rotate-180" />
          </span>
        </div>
      </div>
    </article>
  );
}
