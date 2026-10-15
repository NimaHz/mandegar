import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  FileClock,
  FileText,
  GalleryHorizontalEnd,
  Image,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  MapPinned,
  MessageCircleQuestion,
  PenLine,
  QrCode,
  Settings,
  Shapes,
  ShieldCheck,
  Tags,
  UsersRound,
  Video,
} from "lucide-react";
import type { Route } from "next";

import { adminRoutes } from "@/lib/routes";
import type { ContactStatus, ContentStatus, Permission } from "@/types/admin";
import type { TicketPriority, TicketStatus } from "@/types/support";
import type { WarrantyCodeStatus } from "@/types/warranty";

import type { AdminContent } from "./content";

export type AdminNavKey = keyof AdminContent["shell"]["items"];
export type AdminNavGroupKey = keyof AdminContent["shell"]["groups"];
export type AdminBadgeKey = "tickets" | "messages";

export interface AdminNavItem {
  key: AdminNavKey;
  href: Route;
  icon: LucideIcon;
  permission: Permission;
  exact?: boolean;
  badge?: AdminBadgeKey;
}

export interface AdminNavGroup {
  key: AdminNavGroupKey;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    key: "overview",
    items: [
      {
        key: "dashboard",
        href: adminRoutes.dashboard,
        icon: LayoutDashboard,
        permission: "dashboard:read",
        exact: true,
      },
    ],
  },
  {
    key: "catalog",
    items: [
      { key: "products", href: adminRoutes.products, icon: Boxes, permission: "catalog:read" },
      { key: "categories", href: adminRoutes.categories, icon: Shapes, permission: "catalog:read" },
      { key: "brands", href: adminRoutes.brands, icon: Tags, permission: "catalog:read" },
      { key: "media", href: adminRoutes.media, icon: Image, permission: "media:read" },
    ],
  },
  {
    key: "content",
    items: [
      { key: "guides", href: adminRoutes.guides, icon: Video, permission: "content:read" },
      {
        key: "slides",
        href: adminRoutes.slides,
        icon: GalleryHorizontalEnd,
        permission: "content:read",
      },
      { key: "posts", href: adminRoutes.posts, icon: FileText, permission: "content:read" },
      { key: "authors", href: adminRoutes.authors, icon: PenLine, permission: "content:read" },
      {
        key: "faqs",
        href: adminRoutes.faqs,
        icon: MessageCircleQuestion,
        permission: "content:read",
      },
    ],
  },
  {
    key: "warranty",
    items: [
      {
        key: "warranty",
        href: adminRoutes.warranty,
        icon: QrCode,
        permission: "warranty:read",
        exact: true,
      },
      {
        key: "policies",
        href: adminRoutes.policies,
        icon: ShieldCheck,
        permission: "warranty:policies",
      },
    ],
  },
  {
    key: "service",
    items: [
      {
        key: "tickets",
        href: adminRoutes.tickets,
        icon: LifeBuoy,
        permission: "tickets:read",
        badge: "tickets",
      },
      {
        key: "messages",
        href: adminRoutes.messages,
        icon: Mail,
        permission: "messages:read",
        badge: "messages",
      },
      {
        key: "serviceCenters",
        href: adminRoutes.serviceCenters,
        icon: MapPinned,
        permission: "content:read",
      },
    ],
  },
  {
    key: "settings",
    items: [
      {
        key: "settings",
        href: adminRoutes.settings,
        icon: Settings,
        permission: "settings:write",
      },
      { key: "users", href: adminRoutes.users, icon: UsersRound, permission: "users:manage" },
      { key: "audit", href: adminRoutes.audit, icon: FileClock, permission: "audit:read" },
    ],
  },
];

export const navFor = (permissions: readonly Permission[]) =>
  adminNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => permissions.includes(item.permission)),
    }))
    .filter((group) => group.items.length > 0);

export const isAdminNavActive = (pathname: string, item: Pick<AdminNavItem, "href" | "exact">) =>
  item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(`${item.href}/`);

export type BadgeTone = "chip" | "primary" | "success" | "warning" | "danger" | "solid" | "outline";

export const contentStatusTone: Record<ContentStatus, BadgeTone> = {
  draft: "warning",
  published: "success",
  archived: "chip",
};

export const ticketStatusTone: Record<TicketStatus, BadgeTone> = {
  new: "primary",
  "in-review": "primary",
  "awaiting-customer": "warning",
  scheduled: "primary",
  "in-repair": "warning",
  "awaiting-parts": "warning",
  resolved: "success",
  closed: "chip",
  rejected: "danger",
};

export const priorityTone: Record<TicketPriority, BadgeTone> = {
  low: "chip",
  normal: "outline",
  high: "warning",
  urgent: "danger",
};

export const warrantyStatusTone: Record<WarrantyCodeStatus, BadgeTone> = {
  active: "success",
  revoked: "danger",
  recalled: "warning",
};

export const contactStatusTone: Record<ContactStatus, BadgeTone> = {
  new: "primary",
  read: "chip",
  archived: "outline",
};

export const openTicketStatuses: readonly TicketStatus[] = [
  "new",
  "in-review",
  "awaiting-customer",
  "scheduled",
  "in-repair",
  "awaiting-parts",
];
