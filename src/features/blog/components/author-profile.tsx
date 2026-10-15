import { ExternalLink, PenLine } from "lucide-react";

import { LogoMark } from "@/components/brand/logo-mark";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import { hostOf } from "@/lib/url";
import type { AuthorDetail } from "@/types/content";

import { blogContent } from "../content";
import { AuthorAvatar } from "./author-avatar";

interface AuthorProfileProps {
  author: AuthorDetail;
  locale: Locale;
  postCount: number;
}

export function AuthorProfile({ author, locale, postCount }: AuthorProfileProps) {
  const content = blogContent[locale];
  const links = author.sameAs.filter((href) => /^https?:\/\//i.test(href));

  return (
    <div className="relative isolate overflow-hidden panel p-6 shadow-card sm:p-10">
      <LogoMark
        tone="mono"
        className="pointer-events-none absolute -end-16 -top-20 -z-10 size-72 text-primary/[0.06]"
      />
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
        <AuthorAvatar author={author} size="xl" priority className="ring-4 ring-primary-soft" />
        <div className="flex min-w-0 flex-col gap-3">
          <p className="eyebrow">{content.authorEyebrow}</p>
          <h1 className="font-display text-[2rem] leading-tight font-black text-ink sm:text-[2.75rem]">
            {author.name}
          </h1>
          <p className="text-lead font-bold text-ink-soft">{author.role}</p>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
            <PenLine className="size-4 text-primary" aria-hidden />
            {fill(content.authorPostCount, { count: formatNumber(locale, postCount) })}
          </p>
        </div>
      </div>
      {author.bio && (
        <p className="mt-8 max-w-3xl border-t border-line pt-6 text-lead leading-8 text-pretty text-body sm:text-base sm:leading-9">
          {author.bio}
        </p>
      )}
      {links.length > 0 && (
        <ul
          aria-label={fill(content.authorLinks, { name: author.name })}
          className="mt-6 flex flex-wrap gap-2"
        >
          {links.map((href) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="me noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-line-strong bg-raised px-3.5 text-label font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
              >
                <bdi dir="ltr">{hostOf(href)}</bdi>
                <ExternalLink className="size-3.5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
