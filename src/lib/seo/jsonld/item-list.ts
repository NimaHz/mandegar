import { absoluteUrl } from "../urls";
import type { JsonLdNode } from "./types";

export interface ItemListEntry {
  url: string;
  name: string;
  image?: string | null;
}

interface ItemListInput {
  id: string;
  name: string;
  entries: ItemListEntry[];
  ordered?: boolean;
}

export const itemListNode = ({
  id,
  name,
  entries,
  ordered = false,
}: ItemListInput): JsonLdNode => ({
  "@type": "ItemList",
  "@id": id,
  name,
  numberOfItems: entries.length,
  itemListOrder: `https://schema.org/ItemList${ordered ? "OrderAscending" : "Unordered"}`,
  itemListElement: entries.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: absoluteUrl(entry.url),
    name: entry.name,
    image: entry.image ? absoluteUrl(entry.image) : null,
  })),
});

export const nodeListNode = (id: string, name: string, items: JsonLdNode[]): JsonLdNode => ({
  "@type": "ItemList",
  "@id": id,
  name,
  numberOfItems: items.length,
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item,
  })),
});
