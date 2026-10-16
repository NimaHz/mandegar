import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { LinkPending } from "@/components/providers/navigation-progress";

interface Crumb {
  label: string;
  href?: Route;
}

interface BreadcrumbsProps {
  items: Crumb[];
  label: string;
}

export function Breadcrumbs({ items, label }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className="scrollbar-none overflow-x-auto">
      <ol className="flex items-center gap-1.5 text-label font-semibold whitespace-nowrap text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {index > 0 && <ChevronLeft className="size-3.5 ltr:rotate-180" aria-hidden />}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-primary">
                {item.label}
                <LinkPending />
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
