import { CalendarDays, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ModelCodeText } from "@/components/shared/model-code-text";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { formatDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { blurProps, FULL_WIDTH_SIZES } from "@/lib/image";
import { routes } from "@/lib/routes";
import type { PostListItem } from "@/types/content";

import { homeContent } from "../content";
import { SectionLink } from "./section-link";

interface LatestPostsProps {
  posts: PostListItem[];
  locale: Locale;
}

export function LatestPosts({ posts, locale }: LatestPostsProps) {
  const content = homeContent[locale].posts;
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="home-posts" className="container-page section-y content-auto">
      <SectionHeading
        id="home-posts"
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        action={<SectionLink href={localizePath(locale, routes.blog)}>{content.all}</SectionLink>}
        className="mb-8"
      />
      <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {posts.slice(0, 3).map((post, index) => (
          <RevealItem key={post.slug} className={index === 2 ? "sm:max-lg:hidden" : undefined}>
            <article className="group relative isolate flex h-full card-interactive flex-col overflow-hidden card shadow-card">
              <div className="relative aspect-16/10 overflow-hidden bg-sunken">
                {post.cover && (
                  <Image
                    src={post.cover.src}
                    {...blurProps(post.cover)}
                    alt={post.cover.alt}
                    fill
                    sizes={`(min-width: 1024px) 400px, (min-width: 640px) 50vw, ${FULL_WIDTH_SIZES}`}
                    className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.04]"
                  />
                )}
                <Badge
                  size="sm"
                  className="absolute start-3 top-3 bg-raised/90 text-ink shadow-card backdrop-blur"
                >
                  {content.kinds[post.kind]}
                </Badge>
              </div>
              <div className="flex flex-1 flex-col gap-2.5 p-5">
                <h3 className="line-clamp-2 text-base leading-snug font-extrabold text-balance text-ink sm:text-lg">
                  <Link
                    href={localizePath(locale, routes.post(post.slug))}
                    className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset"
                  >
                    <ModelCodeText text={post.title} />
                  </Link>
                </h3>
                <p className="line-clamp-2 text-label leading-6 text-body">{post.excerpt}</p>
                <div className="mt-auto flex items-center gap-3 border-t border-line pt-3.5">
                  <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-sunken">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar.src}
                        alt=""
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    )}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-xs font-bold text-ink">{post.author.name}</span>
                    <span className="flex flex-wrap items-center gap-x-3 text-caption font-semibold text-muted">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="size-3" aria-hidden />
                        <time dateTime={post.publishedAt}>
                          {formatDate(locale, post.publishedAt)}
                        </time>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="size-3" aria-hidden />
                        {fill(content.minutes, {
                          count: formatNumber(locale, post.readingMinutes),
                        })}
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            </article>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
