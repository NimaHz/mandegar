import { type Locale, localeMeta } from "@/i18n/config";

import { ref, siteIds } from "./ids";
import type { JsonLdNode, JsonLdRef } from "./types";

interface ServiceInput {
  id: (typeof siteIds)["warrantyService" | "afterSalesService"];
  locale: Locale;
  name: string;
  description: string;
  serviceType: string;
  url: string;
  phone?: string | null;
  isRelatedTo?: JsonLdRef[];
  offers?: string[];
}

export const serviceNode = ({
  id,
  locale,
  name,
  description,
  serviceType,
  url,
  phone,
  isRelatedTo,
  offers,
}: ServiceInput): JsonLdNode => ({
  "@type": "Service",
  "@id": id,
  name,
  description,
  serviceType,
  url,
  inLanguage: localeMeta[locale].hreflang,
  provider: ref(siteIds.organization),
  brand: ref(siteIds.brand),
  areaServed: { "@type": "Country", name: "Iran", identifier: "IR" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: url,
    servicePhone: phone ? { "@type": "ContactPoint", telephone: phone } : null,
  },
  hasOfferCatalog: offers?.length
    ? {
        "@type": "OfferCatalog",
        name,
        itemListElement: offers.map((offer) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name: offer },
        })),
      }
    : null,
  isRelatedTo,
});
