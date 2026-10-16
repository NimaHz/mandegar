"use client";

import { m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { springSnappy } from "@/components/motion/easing";
import { fill } from "@/i18n/fill";
import { cn } from "@/lib/cn";
import type { Permission } from "@/types/admin";

import { type AdminBadgeKey, isAdminNavActive, navFor } from "../../config";
import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";

export type AdminCounts = Partial<Record<AdminBadgeKey, number>>;

interface AdminNavListProps {
  permissions: readonly Permission[];
  counts: AdminCounts;
  onNavigate?: () => void;
}

const { shell } = adminContent;

const badgeMeta: Record<AdminBadgeKey, { label: string; className: string }> = {
  tickets: { label: shell.openTickets, className: "bg-primary text-on-primary" },
  messages: { label: shell.unreadMessages, className: "bg-accent text-on-accent" },
};

export function AdminNavList({ permissions, counts, onNavigate }: AdminNavListProps) {
  const pathname = usePathname();
  const indicatorId = useId();
  const groups = navFor(permissions);
  const activeHref = groups
    .flatMap((group) => group.items)
    .filter((item) => isAdminNavActive(pathname, item))
    .toSorted((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="flex flex-col gap-5">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-0.5">
          <p className="px-3 pb-1.5 text-caption font-extrabold tracking-wide text-muted">
            {shell.groups[group.key]}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = item.href === activeHref;
              const Icon = item.icon;
              const count = item.badge ? (counts[item.badge] ?? 0) : 0;
              const badge = item.badge ? badgeMeta[item.badge] : null;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative isolate flex h-10 items-center gap-3 rounded-control px-3 text-sm transition-colors",
                      active
                        ? "font-bold text-primary"
                        : "font-semibold text-ink-soft hover:bg-sunken hover:text-ink",
                    )}
                  >
                    {active && (
                      <m.span
                        layoutId={indicatorId}
                        transition={springSnappy}
                        className="absolute inset-0 -z-10 rounded-control bg-primary-soft"
                      >
                        <span className="absolute inset-y-2.5 start-0 w-1 rounded-e-full bg-primary" />
                      </m.span>
                    )}
                    <Icon
                      className={cn(
                        "size-4.5 shrink-0 transition-colors",
                        active ? "text-primary" : "text-muted group-hover:text-ink",
                      )}
                      strokeWidth={active ? 2.1 : 1.8}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate">{shell.items[item.key]}</span>
                    {badge && count > 0 && (
                      <span
                        className={cn(
                          "grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-2xs font-extrabold",
                          badge.className,
                        )}
                        aria-label={fill(badge.label, { count: faNumber(count) })}
                      >
                        {faNumber(count)}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
