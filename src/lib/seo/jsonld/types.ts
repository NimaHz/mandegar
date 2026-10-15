export type JsonLdValue =
  string | number | boolean | null | undefined | JsonLdValue[] | { [key: string]: JsonLdValue };

export interface JsonLdNode {
  "@type": string | string[];
  "@id"?: string;
  [key: string]: JsonLdValue;
}

export interface JsonLdRef {
  "@id": string;
  [key: string]: JsonLdValue;
}

export interface JsonLdGraph {
  "@context": "https://schema.org";
  "@graph": JsonLdNode[];
}

export type MaybeNode = JsonLdNode | null | undefined | false;
