import type { ImageAsset } from "./common";

export type WarrantyCodeStatus = "active" | "revoked" | "recalled";

export interface WarrantyCoverage {
  months: number;
  partsMonths: number | null;
  startRule: string;
  coverage: string[];
  exclusions: string[];
}

export interface WarrantyMatch extends WarrantyCoverage {
  code: string;
  status: WarrantyCodeStatus;
  productionYear: number;
  product: {
    slug: string;
    name: string;
    modelCode: string;
    image: ImageAsset | null;
    category: { slug: string; name: string };
    brand: { slug: string; name: string; isOwn: boolean };
  };
}

export type WarrantyLookup =
  | { status: "found"; match: WarrantyMatch }
  | { status: "not-found" }
  | { status: "invalid"; reason: "empty" | "length" | "prefix" | "check" }
  | { status: "rate-limited" };

export interface WarrantyPolicySummary extends WarrantyCoverage {
  name: string;
  updatedAt: string;
}
