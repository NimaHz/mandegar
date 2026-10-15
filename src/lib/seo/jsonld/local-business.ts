import type { ServiceCenter } from "@/types/content";

import { parseOpeningHours } from "../opening-hours";
import { nodeId, ref, siteIds } from "./ids";
import type { JsonLdNode } from "./types";

interface ServiceCenterInput {
  listUrl: string;
  center: ServiceCenter;
  anchor?: (slug: string) => string;
  mapUrl?: (center: ServiceCenter) => string | null;
}

export const serviceCenterNode = ({
  listUrl,
  center,
  anchor,
  mapUrl,
}: ServiceCenterInput): JsonLdNode => ({
  "@type": center.kind === "service" ? "LocalBusiness" : "Store",
  "@id": nodeId(listUrl, `center-${center.slug}`),
  name: center.name,
  url: anchor ? `${listUrl}#${anchor(center.slug)}` : null,
  address: {
    "@type": "PostalAddress",
    streetAddress: center.address,
    addressLocality: center.city,
    addressRegion: center.provinceName,
    addressCountry: "IR",
  },
  telephone: center.phones[0],
  contactPoint: center.phones.slice(1).map((phone) => ({
    "@type": "ContactPoint",
    telephone: phone,
    contactType: "customer service",
  })),
  geo:
    center.lat !== null && center.lng !== null
      ? { "@type": "GeoCoordinates", latitude: center.lat, longitude: center.lng }
      : null,
  hasMap: mapUrl?.(center) ?? null,
  openingHoursSpecification: parseOpeningHours(center.hours)?.map((rule) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: rule.days,
    opens: rule.opens,
    closes: rule.closes,
  })),
  areaServed: { "@type": "AdministrativeArea", name: center.provinceName },
  knowsAbout: center.categories.map((category) => category.name),
  parentOrganization: ref(siteIds.organization),
  brand: ref(siteIds.brand),
});
