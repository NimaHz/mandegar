import { toLatinDigits } from "@/lib/persian";

import type { JsonLdGraph, JsonLdNode, JsonLdValue, MaybeNode } from "./types";

const clean = (value: JsonLdValue): JsonLdValue => {
  if (typeof value === "string") {
    const text = toLatinDigits(value).trim();
    return text === "" ? undefined : text;
  }
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  if (Array.isArray(value)) {
    const items = value.map(clean).filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, clean(item)] as const)
      .filter(([, item]) => item !== undefined);
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }
  return value ?? undefined;
};

const isNode = (value: JsonLdValue): value is JsonLdNode =>
  Boolean(value && typeof value === "object" && !Array.isArray(value) && "@type" in value);

export const buildGraph = (nodes: MaybeNode[]): JsonLdGraph => {
  const merged = new Map<string, JsonLdNode>();
  const anonymous: JsonLdNode[] = [];
  for (const node of nodes) {
    if (!node) continue;
    const cleaned = clean(node);
    if (!isNode(cleaned)) continue;
    const id = cleaned["@id"];
    if (!id) {
      anonymous.push(cleaned);
      continue;
    }
    merged.set(id, { ...merged.get(id), ...cleaned });
  }
  return { "@context": "https://schema.org", "@graph": [...merged.values(), ...anonymous] };
};
