"use client";

import type { Route } from "next";
import { usePathname } from "next/navigation";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { adminRoutes } from "@/lib/routes";

import { adminNav } from "../../config";
import { adminContent } from "../../content";

const { shell } = adminContent;

interface Crumb {
  label: string;
  href?: Route;
}

const sections = [
  ...adminNav.flatMap((group) =>
    group.items.map((item) => ({ href: item.href, label: shell.items[item.key] })),
  ),
  { href: adminRoutes.account as Route, label: shell.items.account },
].toSorted((a, b) => b.href.length - a.href.length);

const tailLabel = (segment: string, section: string) => {
  if (segment === "new") return shell.crumbs.new;
  if (segment === "labels") return shell.crumbs.labels;
  return section === adminRoutes.tickets ? shell.crumbs.detail : shell.crumbs.edit;
};

export const crumbsFor = (pathname: string): Crumb[] => {
  const root: Crumb = { label: shell.items.dashboard, href: adminRoutes.dashboard };
  if (pathname === adminRoutes.dashboard) return [{ label: shell.items.dashboard }];
  const section = sections.find(
    (entry) =>
      entry.href !== adminRoutes.dashboard &&
      (pathname === entry.href || pathname.startsWith(`${entry.href}/`)),
  );
  if (!section) return [root];
  if (pathname === section.href) return [root, { label: section.label }];
  const segment = pathname.slice(section.href.length + 1).split("/")[0] ?? "";
  return [
    root,
    { label: section.label, href: section.href },
    { label: tailLabel(segment, section.href) },
  ];
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  return <Breadcrumbs items={crumbsFor(pathname)} label={shell.breadcrumbsLabel} />;
}
