import { ref, siteIds } from "./ids";
import type { JsonLdNode } from "./types";

interface ServiceInput {
  id: (typeof siteIds)["warrantyService" | "afterSalesService"];
  name: string;
  description: string;
  serviceType: string;
  url: string;
  phone?: string | null;
  offers?: string[];
}

export const serviceNode = ({
  id,
  name,
  description,
  serviceType,
  url,
  phone,
  offers,
}: ServiceInput): JsonLdNode => ({
  "@type": "Service",
  "@id": id,
  name,
  description,
  serviceType,
  url,
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
          "@type": "Service",
          name: offer,
          provider: ref(siteIds.organization),
        })),
      }
    : null,
});
