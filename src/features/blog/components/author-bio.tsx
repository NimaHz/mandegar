import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { AuthorDetail, AuthorSummary } from "@/types/content";

import { blogContent } from "../content";
import { AuthorAvatar } from "./author-avatar";

interface AuthorBioProps {
  author: AuthorSummary & Partial<Pick<AuthorDetail, "bio">>;
  locale: Locale;
}

export function AuthorBio({ author, locale }: AuthorBioProps) {
  const content = blogContent[locale];
  const href = localizePath(locale, routes.author(author.slug));

  return (
    <section
      aria-labelledby="post-author"
      className="flex flex-col gap-5 rounded-card border border-line bg-surface p-5 sm:flex-row sm:items-start sm:p-7"
    >
      <AuthorAvatar author={author} size="lg" />
      <div className="flex min-w-0 flex-col gap-2">
        <p className="eyebrow">{content.aboutAuthor}</p>
        <h2 id="post-author" className="font-display text-xl font-black text-ink">
          <Link href={href} className="transition-colors hover:text-primary">
            {author.name}
          </Link>
        </h2>
        <p className="text-sm font-semibold text-muted">{author.role}</p>
        {author.bio && <p className="mt-1 text-sm leading-7 text-body">{author.bio}</p>}
        <Link
          href={href}
          className="group mt-2 inline-flex items-center gap-1.5 self-start text-sm font-bold text-primary"
        >
          {fill(content.authorArticles, { name: author.name })}
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </section>
  );
}
