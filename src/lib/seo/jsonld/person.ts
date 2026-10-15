import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import type { AuthorDetail, AuthorSummary } from "@/types/content";

import { absoluteUrl, localeUrl } from "../urls";
import { personId, ref, siteIds } from "./ids";
import type { JsonLdNode } from "./types";

export const personNode = (locale: Locale, author: AuthorSummary | AuthorDetail): JsonLdNode => ({
  "@type": "Person",
  "@id": personId(locale, author.slug),
  name: author.name,
  url: localeUrl(locale, routes.author(author.slug)),
  jobTitle: author.role,
  image: author.avatar ? absoluteUrl(author.avatar.src) : null,
  description: "bio" in author ? author.bio : null,
  sameAs: "sameAs" in author ? author.sameAs : null,
  worksFor: ref(siteIds.organization),
});
