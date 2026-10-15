import { absoluteUrl } from "../urls";
import { breadcrumbId } from "./ids";
import type { JsonLdNode } from "./types";

export interface BreadcrumbEntry {
  label: string;
  href?: string;
}

export const breadcrumbNode = (url: string, items: BreadcrumbEntry[]): JsonLdNode => ({
  "@type": "BreadcrumbList",
  "@id": breadcrumbId(url),
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    item: item.href ? absoluteUrl(item.href) : url,
  })),
});
