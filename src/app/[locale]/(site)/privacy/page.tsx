import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { LegalDocument } from "@/features/info/components/legal-document";
import { privacyContent } from "@/features/info/legal-content";
import { getLocale } from "@/i18n/get-locale";
import { routes } from "@/lib/routes";
import { webPageGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = privacyContent[locale];
  return pageMetadata({
    locale,
    path: routes.privacy,
    title: content.metaTitle,
    description: content.metaDescription,
  });
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const document = privacyContent[locale];
  const graph = await webPageGraph(locale, {
    path: routes.privacy,
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
