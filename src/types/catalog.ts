import type { DocumentAsset, ImageAsset, SeoFields } from "./common";

export const energyClasses = ["A+++", "A++", "A+", "A", "B", "C", "D"] as const;
export type EnergyClass = (typeof energyClasses)[number];

export const productSorts = ["featured", "newest", "name"] as const;
export type ProductSort = (typeof productSorts)[number];

export const downloadKinds = ["manual", "catalog", "warranty-card", "datasheet"] as const;
export type DownloadKind = (typeof downloadKinds)[number];

export interface BrandSummary {
  slug: string;
  name: string;
  logo: ImageAsset | null;
  isOwn: boolean;
  productCount: number;
}

export interface BrandDetail extends BrandSummary {
  description: string;
  website: string | null;
  seo: SeoFields;
  updatedAt: string;
}

export interface CategorySummary {
  slug: string;
  name: string;
  summary: string;
  icon: string;
  image: ImageAsset | null;
  productCount: number;
  parentSlug: string | null;
}

export interface CategoryDetail extends CategorySummary {
  description: string;
  children: CategorySummary[];
  seo: SeoFields;
  updatedAt: string;
}

export interface SpecItem {
  key: string;
  label: string;
  value: string;
  numeric: number | null;
  unit: string | null;
  unitCode: string | null;
}

export interface SpecGroup {
  title: string;
  items: SpecItem[];
}

export interface KeyFact {
  label: string;
  value: string;
}

export interface ProductFeature {
  icon: string;
  title: string;
  body: string;
}

export interface ProductDownload {
  kind: DownloadKind;
  title: string;
  file: DocumentAsset;
}

export interface ProductFaq {
  question: string;
  answer: string;
}

export interface ProductListItem {
  slug: string;
  modelCode: string;
  name: string;
  tagline: string;
  image: ImageAsset | null;
  category: Pick<CategorySummary, "slug" | "name">;
  brand: Pick<BrandSummary, "slug" | "name" | "isOwn">;
  energyClass: EnergyClass | null;
  isNew: boolean;
  featured: boolean;
  warrantyMonths: number;
}

export interface ProductDetail extends ProductListItem {
  summary: string;
  description: string;
  gallery: ImageAsset[];
  keyFacts: KeyFact[];
  specs: SpecGroup[];
  features: ProductFeature[];
  downloads: ProductDownload[];
  faqs: ProductFaq[];
  guideSlug: string | null;
  releaseYear: number | null;
  seo: SeoFields;
  publishedAt: string | null;
  updatedAt: string;
}

export interface ProductsQuery {
  q: string;
  category: string | null;
  brand: string | null;
  energy: EnergyClass | null;
  sort: ProductSort;
  page: number;
}

export interface FacetCount {
  value: string;
  label: string;
  count: number;
}

export interface ProductFacets {
  categories: FacetCount[];
  brands: FacetCount[];
  energyClasses: FacetCount[];
}

export interface SearchHit {
  kind: "product" | "category" | "guide" | "post";
  href: string;
  title: string;
  subtitle: string;
  image: ImageAsset | null;
}
