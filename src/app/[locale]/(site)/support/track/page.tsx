import type { Metadata } from "next";

import { PageHero } from "@/components/layout/page-hero";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { TrackPanel } from "@/features/support/components/track/track-panel";
import {
  requestFlowContent,
  ticketStatusCopy,
  ticketTypeCopy,
  trackContent,
} from "@/features/support/content";
import { loadTrackSearchParams } from "@/features/support/search-params";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const { meta } = trackContent[locale];
  return {
    ...pageMetadata({
      locale,
      path: routes.track,
      title: meta.title,
      description: meta.description,
      noindex: true,
    }),
    referrer: "no-referrer",
  };
}

export default async function TrackPage({ searchParams }: PageProps<"/[locale]/support/track">) {
  const locale = await getLocale();
  const content = trackContent[locale];
  const request = requestFlowContent[locale];
  const [{ nav, ui }, { t: token }] = await Promise.all([
    getDictionary(locale),
    loadTrackSearchParams(searchParams),
  ]);
  const ticket = token ? await api.support.track(locale, { token }) : null;

  return (
    <>
      <PageHero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={ticket ? undefined : content.hero.description}
        breadcrumbs={
          <Breadcrumbs
            label={ui.breadcrumbsLabel}
            items={[
              { label: nav.home, href: localizePath(locale, routes.home) },
              { label: nav.support, href: localizePath(locale, routes.support) },
              { label: nav.track },
            ]}
          />
        }
      />
      <div className="container-page pb-16 sm:pb-20">
        <div className="mx-auto max-w-6xl">
          <TrackPanel
            key={token}
            initial={ticket ? { ticket, token } : null}
            tokenInvalid={Boolean(token) && !ticket}
            copy={content}
            statuses={ticketStatusCopy[locale]}
            types={ticketTypeCopy[locale]}
            attachmentLabels={{ ...request.attachments, optional: request.product.optional }}
            phonePlaceholder={request.contact.phonePlaceholder}
          />
        </div>
      </div>
    </>
  );
}
