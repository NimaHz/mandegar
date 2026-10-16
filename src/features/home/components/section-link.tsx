import { ArrowLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { LinkPending } from "@/components/providers/navigation-progress";
import { cn } from "@/lib/cn";

interface SectionLinkProps {
  href: Route;
  children: ReactNode;
  tone?: "default" | "inverse";
}

export function SectionLink({ href, children, tone = "default" }: SectionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex h-10 shrink-0 items-center gap-1.5 rounded-control text-sm font-bold transition-colors",
        tone === "inverse"
          ? "text-white hover:text-accent"
          : "text-primary hover:text-primary-strong",
      )}
    >
      {children}
      <ArrowLeft
        className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
        aria-hidden
      />
      <LinkPending />
    </Link>
  );
}
