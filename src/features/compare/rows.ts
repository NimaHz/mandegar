import type { ReactNode } from "react";

import type { ProductDetail, SpecItem } from "@/types/catalog";

export interface CompareRow {
  key: string;
  label: string;
  cells: ReactNode[];
  differs: boolean;
}

export interface CompareGroup {
  title: string;
  rows: CompareRow[];
}

const specIndex = (product: ProductDetail) =>
  new Map(product.specs.flatMap((group) => group.items.map((item) => [item.key, item] as const)));

const signature = (item: SpecItem | undefined) =>
  item ? `${item.numeric ?? item.value}|${item.unitCode ?? item.unit ?? ""}` : "";

export const differs = (values: string[]) => new Set(values).size > 1;

export const specGroups = (
  products: ProductDetail[],
  renderValue: (item: SpecItem | undefined) => ReactNode,
  skip: readonly string[] = [],
): CompareGroup[] => {
  const indexes = products.map(specIndex);
  const layout = new Map<string, Map<string, string>>();
  for (const product of products) {
    for (const group of product.specs) {
      const rows = layout.get(group.title) ?? new Map<string, string>();
      for (const item of group.items) if (!rows.has(item.key)) rows.set(item.key, item.label);
      layout.set(group.title, rows);
    }
  }
  const seen = new Set<string>(skip);
  return [...layout].flatMap(([title, rows]) => {
    const entries = [...rows].filter(([key]) => !seen.has(key));
    entries.forEach(([key]) => seen.add(key));
    if (entries.length === 0) return [];
    return [
      {
        title,
        rows: entries.map(([key, label]) => {
          const items = indexes.map((index) => index.get(key));
          return {
            key,
            label,
            cells: items.map(renderValue),
            differs: differs(items.map(signature)),
          };
        }),
      },
    ];
  });
};
