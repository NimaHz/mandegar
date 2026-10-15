import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  headingLevel?: "h2" | "h3";
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  headingLevel = "h3",
  className,
}: EmptyStateProps) {
  const Heading = headingLevel;

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 empty-shell px-6 py-12 text-center",
        className,
      )}
    >
      <span className="icon-tile size-12 rounded-field">
        <Icon className="size-5.5" aria-hidden />
      </span>
      <Heading className="text-base font-extrabold text-ink">{title}</Heading>
      <p className="max-w-sm text-sm leading-7 text-body">{description}</p>
      {action}
    </div>
  );
}
