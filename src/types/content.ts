import type { GeoPoint, ImageAsset, SeoFields } from "./common";

export const faqGroups = ["general", "warranty", "installation", "products", "support"] as const;
export type FaqGroup = (typeof faqGroups)[number];

export const postKinds = ["guide", "news", "tips"] as const;
export type PostKind = (typeof postKinds)[number];

export const serviceCenterKinds = ["dealer", "service", "both"] as const;
export type ServiceCenterKind = (typeof serviceCenterKinds)[number];

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: ImageAsset;
  mobileImage: ImageAsset | null;
  tone: "light" | "dark";
}

export interface Faq {
  id: string;
  group: FaqGroup;
  question: string;
  answer: string;
}

export type GuideVideo =
  | { kind: "upload"; src: string; mime: string; poster: ImageAsset | null }
  | { kind: "aparat"; hash: string; poster: ImageAsset | null };

export interface GuideStep {
  title: string;
  body: string;
  image: ImageAsset | null;
}

export interface GuideChapter {
  title: string;
  startSec: number;
}

export interface GuideListItem {
  slug: string;
  title: string;
  summary: string;
  poster: ImageAsset | null;
  durationSec: number | null;
  stepCount: number;
  categories: { slug: string; name: string }[];
}

export interface GuideDetail extends GuideListItem {
  video: GuideVideo | null;
  steps: GuideStep[];
  tools: string[];
  safety: string[];
  chapters: GuideChapter[];
  products: { slug: string; name: string; modelCode: string }[];
  publishedAt: string | null;
  updatedAt: string;
}

export interface AuthorSummary {
  slug: string;
  name: string;
  role: string;
  avatar: ImageAsset | null;
}

export interface AuthorDetail extends AuthorSummary {
  bio: string;
  sameAs: string[];
}

export interface PostListItem {
  slug: string;
  kind: PostKind;
  title: string;
  excerpt: string;
  cover: ImageAsset | null;
  author: AuthorSummary;
  readingMinutes: number;
  publishedAt: string;
}

export interface PostDetail extends PostListItem {
  body: string;
  relatedProducts: { slug: string; name: string; modelCode: string; image: ImageAsset | null }[];
  seo: SeoFields;
  updatedAt: string;
}

export interface PostsQuery {
  kind: PostKind | null;
  page: number;
}

export interface ServiceCenter {
  slug: string;
  kind: ServiceCenterKind;
  name: string;
  province: string;
  provinceName: string;
  city: string;
  address: string;
  phones: string[];
  hours: string;
  lat: number | null;
  lng: number | null;
  categories: { slug: string; name: string }[];
}

export interface ServiceCentersQuery {
  province: string | null;
  kind: ServiceCenterKind | null;
}

export interface ProvinceCount {
  code: string;
  name: string;
  count: number;
}

export interface SocialLinks {
  aparat: string | null;
  instagram: string | null;
  telegram: string | null;
  bale: string | null;
  eitaa: string | null;
  rubika: string | null;
  linkedin: string | null;
}

export interface SiteSettings {
  phones: { label: string; value: string }[];
  emails: { label: string; value: string }[];
  address: string;
  hours: string;
  socials: SocialLinks;
  location: GeoPoint | null;
  stats: { years: number; serviceCenters: number; models: number; warrantyMonths: number };
  company: {
    legalName: string;
    nationalId: string | null;
    registrationNo: string | null;
    foundingYear: number | null;
  };
}
