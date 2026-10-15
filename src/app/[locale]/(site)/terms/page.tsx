import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/features/info/components/legal-document";
import { termsContent } from "@/features/info/legal-content";
import { getLocale } from "@/i18n/get-locale";
import { routes } from "@/lib/routes";
import { webPageGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = termsContent[locale];
  return pageMetadata({
    locale,
    path: routes.terms,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function TermsPage() {
  const locale = await getLocale();
  const document = termsContent[locale];
  const graph = await webPageGraph(locale, {
    path: routes.terms,
    name: document.title,
    description: document.description,
    dateModified: document.updatedAt,
  });
  return (
    <>
      <JsonLd data={graph} />
      <LegalDocument locale={locale} document={document} />
    </>
  );
}
