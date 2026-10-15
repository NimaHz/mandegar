import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

interface PanelCardProps {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function PanelCard({
  title,
  icon: Icon,
  action,
  description,
  children,
  className,
}: PanelCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex min-w-0 flex-col gap-4 card p-4 shadow-card sm:p-5", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id={titleId}
            className="flex min-w-0 items-center gap-2.5 text-lead font-extrabold text-ink"
          >
            {Icon && (
              <span className="icon-tile size-8">
                <Icon className="size-4" strokeWidth={2} aria-hidden />
              </span>
            )}
            <span className="truncate">{title}</span>
          </h2>
          {description && <p className="text-xs leading-6 text-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function CardLink({ href, children }: { href: Route; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-bold text-primary transition-colors hover:bg-primary-soft"
    >
      {children}
      <ArrowLeft
        className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 ltr:rotate-180"
        aria-hidden
      />
    </Link>
  );
}
