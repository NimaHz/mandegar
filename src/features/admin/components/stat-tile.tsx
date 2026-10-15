import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/cn";

export interface StatTileProps {
  label: string;
  value: string;
  caption?: string;
  icon: LucideIcon;
  tone?: string;
  href?: Route;
  className?: string;
}

function StatTile({
  label,
  value,
  caption,
  icon: Icon,
  tone = "bg-primary-soft text-primary",
  href,
  className,
}: StatTileProps) {
  const body = (
    <>
      <span className={cn("icon-tile size-9", tone)}>
        <Icon className="size-4.5" strokeWidth={1.9} aria-hidden />
      </span>
      <span className="font-display text-[1.75rem] leading-none font-black text-ink">{value}</span>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-label font-bold text-ink">{label}</span>
        {caption && <span className="truncate text-caption text-muted">{caption}</span>}
      </span>
    </>
  );
  const shell = cn("flex min-w-0 flex-col gap-3 card p-4 shadow-card", className);

  return href ? (
    <Link href={href} className={cn(shell, "card-interactive")}>
      {body}
    </Link>
  ) : (
    <div className={shell}>{body}</div>
  );
}

export function StatGrid({ items, className }: { items: StatTileProps[]; className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <StatTile key={item.label} {...item} />
      ))}
    </div>
  );
}
