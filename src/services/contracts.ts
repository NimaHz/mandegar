import type { Locale } from "@/i18n/config";
import type {
  BrandDetail,
  BrandSummary,
  CategoryDetail,
  CategorySummary,
  ProductDetail,
  ProductFacets,
  ProductListItem,
  ProductsQuery,
  SearchHit,
} from "@/types/catalog";
import type { Paginated } from "@/types/common";
import type {
  AuthorDetail,
  Faq,
  FaqGroup,
  GuideDetail,
  GuideListItem,
  HeroSlide,
  PostDetail,
  PostListItem,
  PostsQuery,
  ProvinceCount,
  ServiceCenter,
  ServiceCentersQuery,
  SiteSettings,
} from "@/types/content";
import type { PublicTicket, TrackTicketInput } from "@/types/support";
import type { WarrantyLookup, WarrantyPolicySummary } from "@/types/warranty";

export interface CatalogService {
  categories: (locale: Locale) => Promise<CategorySummary[]>;
  category: (locale: Locale, slug: string) => Promise<CategoryDetail | null>;
  categorySlugs: () => Promise<string[]>;
  products: (locale: Locale, query: ProductsQuery) => Promise<Paginated<ProductListItem>>;
  facets: (locale: Locale) => Promise<ProductFacets>;
  featured: (locale: Locale, limit: number) => Promise<ProductListItem[]>;
  latest: (locale: Locale, limit: number) => Promise<ProductListItem[]>;
  byCategory: (locale: Locale, categorySlug: string, limit?: number) => Promise<ProductListItem[]>;
  byBrand: (locale: Locale, brandSlug: string) => Promise<ProductListItem[]>;
  product: (locale: Locale, slug: string) => Promise<ProductDetail | null>;
  related: (locale: Locale, product: ProductDetail, limit?: number) => Promise<ProductListItem[]>;
  compare: (locale: Locale, slugs: string[]) => Promise<ProductDetail[]>;
  productSlugs: () => Promise<string[]>;
  brands: (locale: Locale) => Promise<BrandSummary[]>;
  brand: (locale: Locale, slug: string) => Promise<BrandDetail | null>;
  brandSlugs: () => Promise<string[]>;
  search: (locale: Locale, q: string, limit?: number) => Promise<SearchHit[]>;
}

export interface ContentService {
  heroSlides: (locale: Locale) => Promise<HeroSlide[]>;
  faqs: (locale: Locale, group?: FaqGroup) => Promise<Faq[]>;
  guides: (locale: Locale) => Promise<GuideListItem[]>;
  guide: (locale: Locale, slug: string) => Promise<GuideDetail | null>;
  guideSlugs: () => Promise<string[]>;
  posts: (locale: Locale, query: PostsQuery) => Promise<Paginated<PostListItem>>;
  latestPosts: (locale: Locale, limit: number) => Promise<PostListItem[]>;
  post: (locale: Locale, slug: string) => Promise<PostDetail | null>;
  postSlugs: () => Promise<string[]>;
  author: (locale: Locale, slug: string) => Promise<AuthorDetail | null>;
  authorPosts: (locale: Locale, slug: string) => Promise<PostListItem[]>;
  authorSlugs: () => Promise<string[]>;
  serviceCenters: (locale: Locale, query: ServiceCentersQuery) => Promise<ServiceCenter[]>;
  provinces: (locale: Locale) => Promise<ProvinceCount[]>;
  settings: (locale: Locale) => Promise<SiteSettings>;
}

export interface WarrantyService {
  lookup: (locale: Locale, code: string, clientKey: string) => Promise<WarrantyLookup>;
  policies: (locale: Locale) => Promise<WarrantyPolicySummary[]>;
}

export interface SupportService {
  track: (locale: Locale, input: TrackTicketInput) => Promise<PublicTicket | null>;
}

export interface Api {
  catalog: CatalogService;
  content: ContentService;
  warranty: WarrantyService;
  support: SupportService;
}
