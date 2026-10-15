import type { LucideIcon } from "lucide-react";
import {
  BookOpenText,
  Building2,
  ClipboardList,
  House,
  LayoutGrid,
  LifeBuoy,
  MapPin,
  MessagesSquare,
  Newspaper,
  PhoneCall,
  SearchCheck,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/fa";
import { routes } from "@/lib/routes";

export type NavLabel = keyof Dictionary["nav"];

export interface NavItem {
  href: string;
  label: NavLabel;
  icon: LucideIcon;
  exact?: boolean;
  hideBelow?: "xl" | "2xl";
}

export interface NavGroup {
  title: NavLabel;
  links: NavItem[];
}

export const primaryNav: NavItem[] = [
  { href: routes.brands, label: "brands", icon: Building2 },
  { href: routes.guides, label: "guides", icon: Wrench },
  { href: routes.blog, label: "blog", icon: Newspaper, hideBelow: "xl" },
  { href: routes.about, label: "about", icon: BookOpenText, hideBelow: "2xl" },
  { href: routes.contact, label: "contact", icon: PhoneCall, hideBelow: "2xl" },
];

export const supportNav: NavItem[] = [
  { href: routes.warranty, label: "warranty", icon: ShieldCheck },
  { href: routes.serviceRequest, label: "serviceRequest", icon: LifeBuoy },
  { href: routes.track, label: "track", icon: SearchCheck },
  { href: routes.serviceCenters, label: "serviceCenters", icon: MapPin },
  { href: routes.guides, label: "guides", icon: Wrench },
  { href: routes.faq, label: "faq", icon: MessagesSquare },
];

export const bottomNav: (NavItem & {
  label: "home" | "products" | "warranty" | "support" | "track";
})[] = [
  { href: routes.home, label: "home", icon: House, exact: true },
  { href: routes.products, label: "products", icon: LayoutGrid },
  { href: routes.warranty, label: "warranty", icon: ShieldCheck },
  { href: routes.support, label: "support", icon: LifeBuoy },
  { href: routes.track, label: "track", icon: ClipboardList },
];

export const footerGroups: NavGroup[] = [
  {
    title: "support",
    links: supportNav,
  },
  {
    title: "about",
    links: [
      { href: routes.about, label: "about", icon: BookOpenText },
      { href: routes.brands, label: "brands", icon: Building2 },
      { href: routes.blog, label: "blog", icon: Newspaper },
      { href: routes.contact, label: "contact", icon: PhoneCall },
      { href: routes.glossary, label: "glossary", icon: BookOpenText },
      { href: routes.terms, label: "terms", icon: BookOpenText },
      { href: routes.privacy, label: "privacy", icon: BookOpenText },
    ],
  },
];

export const isNavActive = (pathname: string, { href, exact }: Pick<NavItem, "href" | "exact">) =>
  exact || href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
