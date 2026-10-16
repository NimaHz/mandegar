import type { DownloadKind, EnergyClass } from "./catalog";
import type { GeoPoint, LocalizedText } from "./common";
import type { FaqGroup, PostKind, ServiceCenterKind, SocialLinks } from "./content";
import type { ContactDepartment, TicketPriority, TicketStatus, TicketType } from "./support";
import type { WarrantyCodeStatus } from "./warranty";

export const userRoles = ["owner", "editor", "support"] as const;
export type UserRole = (typeof userRoles)[number];

export const permissions = [
  "dashboard:read",
  "catalog:read",
  "catalog:write",
  "content:read",
  "content:write",
  "media:read",
  "media:write",
  "warranty:read",
  "warranty:write",
  "warranty:policies",
  "tickets:read",
  "tickets:write",
  "messages:read",
  "messages:write",
  "settings:write",
  "users:manage",
  "audit:read",
] as const;
export type Permission = (typeof permissions)[number];

export const contentStatuses = ["draft", "published", "archived"] as const;
export type ContentStatus = (typeof contentStatuses)[number];

export const mediaKinds = ["image", "video", "document"] as const;
export type MediaKind = (typeof mediaKinds)[number];

export const mediaScopes = ["library", "ticket"] as const;
export type MediaScope = (typeof mediaScopes)[number];

export const mediaUsageEntities = [
  "brand",
  "category",
  "product",
  "product-download",
  "guide",
  "slide",
  "author",
  "post",
  "faq",
  "ticket",
] as const;
export type MediaUsageEntity = (typeof mediaUsageEntities)[number];

export const warrantyCodeStatuses = [
  "active",
  "revoked",
  "recalled",
] as const satisfies readonly WarrantyCodeStatus[];

export const warrantyCodeKinds = ["batch", "unit"] as const;
export type WarrantyCodeKindValue = (typeof warrantyCodeKinds)[number];

export const contactStatuses = ["new", "read", "archived"] as const;
export type ContactStatus = (typeof contactStatuses)[number];

export const slideTones = ["light", "dark"] as const;
export type SlideTone = (typeof slideTones)[number];

export const messageAuthorTypes = ["customer", "staff", "system"] as const;
export type MessageAuthorType = (typeof messageAuthorTypes)[number];

export const notificationStatuses = ["sent", "failed", "skipped"] as const;
export type NotificationStatus = (typeof notificationStatuses)[number];

export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface LocalizedSeo {
  title: LocalizedText;
  description: LocalizedText;
}

export interface SpecTemplateItem {
  key: string;
  label: LocalizedText;
  unit: LocalizedText | null;
  unitCode: string | null;
}

export interface SpecGroupTemplate {
  title: LocalizedText;
  items: SpecTemplateItem[];
}

export interface LocalizedSpecItem extends SpecTemplateItem {
  value: LocalizedText;
  numeric: number | null;
}

export interface LocalizedSpecGroup {
  title: LocalizedText;
  items: LocalizedSpecItem[];
}

export interface LocalizedKeyFact {
  label: LocalizedText;
  value: LocalizedText;
}

export interface LocalizedFeature {
  icon: string;
  title: LocalizedText;
  body: LocalizedText;
}

export interface LocalizedDownload {
  kind: DownloadKind;
  title: LocalizedText;
  mediaId: string;
}

export interface LocalizedFaq {
  question: LocalizedText;
  answer: LocalizedText;
}

export type GuideVideoSource =
  | { kind: "upload"; mediaId: string; posterMediaId: string | null }
  | { kind: "aparat"; hash: string; posterMediaId: string | null };

export interface LocalizedGuideStep {
  title: LocalizedText;
  body: LocalizedText;
  mediaId: string | null;
}

export interface LocalizedChapter {
  title: LocalizedText;
  startSec: number;
}

export interface LabeledValue {
  label: LocalizedText;
  value: string;
}

export interface ContactSettings {
  phones: LabeledValue[];
  emails: LabeledValue[];
  address: LocalizedText;
  hours: LocalizedText;
  socials: SocialLinks;
  location: GeoPoint | null;
}

export interface SeoSettings {
  defaultTitle: LocalizedText;
  defaultDescription: LocalizedText;
}

export interface StatsSettings {
  years: number;
  serviceCenters: number;
  models: number;
  warrantyMonths: number;
}

export interface CompanySettings {
  legalName: LocalizedText;
  nationalId: string | null;
  registrationNo: string | null;
  foundingYear: number | null;
}

export interface SettingsValues {
  contact: ContactSettings;
  seo: SeoSettings;
  stats: StatsSettings;
  company: CompanySettings;
}

export const settingKeys = ["contact", "seo", "stats", "company"] as const;
export type SettingKey = (typeof settingKeys)[number];

export interface AdminIdentity {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  totpEnabled: boolean;
  mustChangePassword: boolean;
  permissions: Permission[];
}

export interface AdminRef {
  id: string;
  name: string;
}

export interface AdminOption {
  id: string;
  slug: string | null;
  label: LocalizedText;
  hint: string | null;
}

export interface AdminMediaRef {
  id: string;
  kind: MediaKind;
  url: string;
  mime: string;
  width: number | null;
  height: number | null;
  alt: LocalizedText;
}

export interface AdminAttachment extends AdminMediaRef {
  name: string;
  size: number;
}

export interface AdminMedia extends AdminMediaRef {
  storageKey: string;
  size: number;
  durationSec: number | null;
  sha256: string;
  originalName: string | null;
  uploadedBy: AdminRef | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMediaUsage {
  entity: MediaUsageEntity;
  id: string;
  label: string;
}

export interface AdminBrand {
  id: string;
  slug: string;
  name: LocalizedText;
  description: LocalizedText;
  logoMediaId: string | null;
  logo: AdminMediaRef | null;
  website: string | null;
  isOwn: boolean;
  sortOrder: number;
  published: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: string;
  slug: string;
  parentId: string | null;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  icon: string;
  imageMediaId: string | null;
  image: AdminMediaRef | null;
  defaultGuideId: string | null;
  specTemplate: SpecGroupTemplate[];
  seo: LocalizedSeo | null;
  sortOrder: number;
  published: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCatalogRef {
  id: string;
  slug: string;
  name: LocalizedText;
}

export interface AdminProductListItem {
  id: string;
  slug: string;
  modelCode: string;
  name: LocalizedText;
  status: ContentStatus;
  featured: boolean;
  isNew: boolean;
  category: AdminCatalogRef;
  brand: AdminCatalogRef;
  image: AdminMediaRef | null;
  warrantyMonths: number;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminProductImage {
  id: string;
  mediaId: string;
  media: AdminMediaRef;
  alt: LocalizedText;
  sortOrder: number;
  isPrimary: boolean;
}

export interface AdminProduct {
  id: string;
  slug: string;
  modelCode: string;
  categoryId: string;
  brandId: string;
  status: ContentStatus;
  featured: boolean;
  isNew: boolean;
  releaseYear: number | null;
  energyClass: EnergyClass | null;
  name: LocalizedText;
  tagline: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  specs: LocalizedSpecGroup[];
  keyFacts: LocalizedKeyFact[];
  features: LocalizedFeature[];
  downloads: LocalizedDownload[];
  faqs: LocalizedFaq[];
  guideId: string | null;
  warrantyMonths: number;
  relatedIds: string[];
  seo: LocalizedSeo | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: AdminProductImage[];
  media: Record<string, AdminMediaRef>;
}

export interface AdminGuideListItem {
  id: string;
  slug: string;
  title: LocalizedText;
  published: boolean;
  stepCount: number;
  videoKind: GuideVideoSource["kind"] | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminGuide {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  video: GuideVideoSource | null;
  durationSec: number | null;
  steps: LocalizedGuideStep[];
  tools: LocalizedText[];
  safety: LocalizedText[];
  chapters: LocalizedChapter[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  media: Record<string, AdminMediaRef>;
}

export interface AdminWarrantyPolicy {
  id: string;
  name: string;
  months: number;
  partsMonths: number | null;
  startRule: LocalizedText;
  coverage: LocalizedText[];
  exclusions: LocalizedText[];
  effectiveFrom: string;
  codeCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminWarrantyCode {
  id: string;
  code: string;
  formatted: string;
  kind: WarrantyCodeKindValue;
  status: WarrantyCodeStatus;
  productionYear: number;
  note: string | null;
  issuedAt: string;
  product: AdminCatalogRef & { modelCode: string };
  policy: AdminRef;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSlide {
  id: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  ctaLabel: LocalizedText | null;
  ctaHref: string | null;
  imageMediaId: string;
  image: AdminMediaRef;
  mobileImageMediaId: string | null;
  mobileImage: AdminMediaRef | null;
  tone: SlideTone;
  sortOrder: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicketListItem {
  id: string;
  trackingCode: string;
  formattedTrackingCode: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  name: string;
  phone: string;
  subject: string;
  province: string;
  city: string;
  assignee: AdminRef | null;
  product: (AdminCatalogRef & { modelCode: string }) | null;
  firstResponseDue: string;
  resolutionDue: string;
  firstRespondedAt: string | null;
  breaching: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicketMessage {
  id: string;
  authorType: MessageAuthorType;
  author: AdminRef | null;
  body: string;
  internal: boolean;
  attachments: AdminAttachment[];
  createdAt: string;
}

export interface AdminTicket extends AdminTicketListItem {
  email: string | null;
  address: string;
  purchaseDate: string | null;
  description: string;
  warrantyCode: {
    id: string;
    code: string;
    formatted: string;
    status: WarrantyCodeStatus;
    productionYear: number;
  } | null;
  resolvedAt: string | null;
  closedAt: string | null;
  messages: AdminTicketMessage[];
}

export interface AdminContactMessage {
  id: string;
  department: ContactDepartment;
  name: string;
  phone: string;
  email: string | null;
  subject: string;
  body: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminServiceCenter {
  id: string;
  slug: string;
  kind: ServiceCenterKind;
  name: LocalizedText;
  province: string;
  city: LocalizedText;
  address: LocalizedText;
  phones: string[];
  hours: LocalizedText;
  lat: number | null;
  lng: number | null;
  categoryIds: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminFaq {
  id: string;
  group: FaqGroup;
  question: LocalizedText;
  answer: LocalizedText;
  sortOrder: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuthor {
  id: string;
  slug: string;
  name: LocalizedText;
  role: LocalizedText;
  bio: LocalizedText;
  avatarMediaId: string | null;
  avatar: AdminMediaRef | null;
  sameAs: string[];
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPostListItem {
  id: string;
  slug: string;
  kind: PostKind;
  title: LocalizedText;
  status: ContentStatus;
  author: AdminCatalogRef;
  cover: AdminMediaRef | null;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminPost {
  id: string;
  slug: string;
  kind: PostKind;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: LocalizedText;
  coverMediaId: string | null;
  cover: AdminMediaRef | null;
  authorId: string;
  relatedProductIds: string[];
  status: ContentStatus;
  seo: LocalizedSeo | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  totpEnabled: boolean;
  active: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSession {
  id: string;
  current: boolean;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
}

export interface AdminAuditLog {
  id: string;
  actor: AdminRef | null;
  action: string;
  entity: string;
  entityId: string | null;
  diff: JsonValue;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export interface DashboardStats {
  products: Record<ContentStatus, number>;
  categories: number;
  brands: number;
  media: { count: number; bytes: number };
  tickets: { open: number; urgent: number; breaching: number; today: number };
  messages: { unread: number };
  warrantyCodes: Record<WarrantyCodeStatus, number>;
  recentTickets: AdminTicketListItem[];
}

export interface AdminCounts {
  openTickets: number;
  unreadMessages: number;
}

export const adminSorts = {
  products: ["updated-desc", "created-desc", "name-asc", "model-asc"],
  categories: ["order-asc", "updated-desc", "created-desc", "name-asc"],
  guides: ["updated-desc", "created-desc", "name-asc"],
  posts: ["updated-desc", "created-desc", "name-asc"],
  tickets: ["priority-desc", "due-asc", "updated-desc", "created-desc", "name-asc"],
  serviceCenters: ["province-asc", "updated-desc", "created-desc", "name-asc"],
  media: ["created-desc", "updated-desc", "name-asc"],
  messages: ["created-desc", "updated-desc", "name-asc"],
  warrantyCodes: ["year-desc", "updated-desc", "created-desc", "model-asc"],
} as const satisfies Record<string, readonly [string, ...string[]]>;

export type AdminSortEntity = keyof typeof adminSorts;
export type AdminSort<TEntity extends AdminSortEntity = AdminSortEntity> =
  (typeof adminSorts)[TEntity][number];

export interface AdminListQuery {
  q: string;
  page: number;
}

export interface AdminProductsQuery extends AdminListQuery {
  status: ContentStatus | null;
  categoryId: string | null;
  brandId: string | null;
  sort: AdminSort<"products">;
}

export interface AdminCategoriesQuery extends AdminListQuery {
  sort: AdminSort<"categories">;
}

export interface AdminGuidesQuery extends AdminListQuery {
  published: boolean | null;
  sort: AdminSort<"guides">;
}

export interface AdminMediaQuery extends AdminListQuery {
  kind: MediaKind | null;
  sort: AdminSort<"media">;
}

export interface AdminWarrantyCodesQuery extends AdminListQuery {
  productId: string | null;
  productionYear: number | null;
  status: WarrantyCodeStatus | null;
  kind: WarrantyCodeKindValue | null;
  sort: AdminSort<"warrantyCodes">;
}

export interface AdminTicketsQuery extends AdminListQuery {
  type: TicketType | null;
  status: TicketStatus | null;
  priority: TicketPriority | null;
  assigneeId: string | null;
  breaching: boolean;
  open: boolean;
  sort: AdminSort<"tickets">;
}

export interface AdminMessagesQuery extends AdminListQuery {
  status: ContactStatus | null;
  department: ContactDepartment | null;
  sort: AdminSort<"messages">;
}

export interface AdminServiceCentersQuery extends AdminListQuery {
  province: string | null;
  kind: ServiceCenterKind | null;
  sort: AdminSort<"serviceCenters">;
}

export interface AdminFaqsQuery extends AdminListQuery {
  group: FaqGroup | null;
}

export interface AdminPostsQuery extends AdminListQuery {
  kind: PostKind | null;
  status: ContentStatus | null;
  authorId: string | null;
  sort: AdminSort<"posts">;
}

export interface AdminAuditQuery extends AdminListQuery {
  entity: string | null;
  actorId: string | null;
}
