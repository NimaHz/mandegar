import { CalendarDays, Clock3, RefreshCw } from "lucide-react";
import Link from "next/link";

import { ModelCodeText } from "@/components/shared/model-code-text";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/fa";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { formatDate } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import type { PostDetail } from "@/types/content";

import { blogContent } from "../content";
import { AuthorAvatar } from "./author-avatar";
import { KindBadge } from "./kind-badge";

interface PostHeaderProps {
  post: PostDetail;
  locale: Locale;
  dictionary: Pick<Dictionary, "nav" | "ui" | "common">;
}

export function PostHeader({ post, locale, dictionary }: PostHeaderProps) {
  const content = blogContent[locale];
  const published = formatDate(locale, post.publishedAt);
  const updated = formatDate(locale, post.updatedAt);
  const showUpdated = updated !== published && post.updatedAt > post.publishedAt;

  return (
    <header className="flex flex-col gap-6">
      <Breadcrumbs
        label={dictionary.ui.breadcrumbsLabel}
        items={[
          { label: dictionary.nav.home, href: localizePath(locale, routes.home) },
          { label: dictionary.nav.blog, href: localizePath(locale, routes.blog) },
          { label: post.title },
        ]}
      />
      <div className="flex max-w-4xl animate-rise flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          <KindBadge kind={post.kind} locale={locale} size="md" />
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted">
            <Clock3 className="size-3.5" aria-hidden />
            {fill(content.readingTime, { count: formatNumber(locale, post.readingMinutes) })}
          </span>
        </div>
        <h1 className="font-display text-[1.875rem] leading-[1.4] font-black text-balance text-ink sm:text-[2.5rem] lg:text-[3rem]">
          <ModelCodeText text={post.title} />
        </h1>
        <p className="max-w-3xl text-lg leading-9 text-pretty text-body sm:text-xl sm:leading-10">
          {post.excerpt}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4 border-y border-line py-4">
        <div className="flex items-center gap-3">
          <AuthorAvatar author={post.author} size="md" priority />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm text-muted">
              {content.by}{" "}
              <Link
                href={localizePath(locale, routes.author(post.author.slug))}
                rel="author"
                className="font-extrabold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
              >
                {post.author.name}
              </Link>
            </span>
            <span className="text-xs text-muted">{post.author.role}</span>
          </span>
        </div>
        <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-muted">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5" aria-hidden />
            <dt>{content.published}:</dt>
            <dd className="text-ink-soft">
              <time dateTime={post.publishedAt}>{published}</time>
            </dd>
          </div>
          {showUpdated && (
            <div className="flex items-center gap-1.5">
              <RefreshCw className="size-3.5" aria-hidden />
              <dt>{dictionary.common.updatedAt}:</dt>
              <dd className="text-ink-soft">
                <time dateTime={post.updatedAt}>{updated}</time>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </header>
  );
}
