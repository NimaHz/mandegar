export interface LocalizedText {
  fa: string;
  en: string;
}

export interface Option<TValue extends string = string> {
  value: TValue;
  label: string;
}

export interface Paginated<TItem> {
  items: TItem[];
  total: number;
  page: number;
  pageCount: number;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
  placeholder?: string | null;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface DocumentAsset {
  href: string;
  size: number;
  mime: string;
}

export interface SeoFields {
  title: string | null;
  description: string | null;
}
