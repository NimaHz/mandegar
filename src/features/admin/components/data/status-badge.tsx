import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

import type { BadgeTone } from "../../config";

const dotTone: Record<BadgeTone, string> = {
  chip: "bg-muted",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  solid: "bg-on-inverse",
  outline: "bg-subtle",
};

interface StatusBadgeProps {
  tone: BadgeTone;
  label: string;
  dot?: boolean;
  className?: string;
}

export function StatusBadge({ tone, label, dot = true, className }: StatusBadgeProps) {
  return (
    <Badge tone={tone} size="sm" className={cn("font-bold", className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dotTone[tone])} aria-hidden />}
      {label}
    </Badge>
  );
}
