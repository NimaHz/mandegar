import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { PostKind } from "@/types/content";

import { postKindMeta } from "../config";
import { blogContent } from "../content";

interface KindBadgeProps {
  kind: PostKind;
  locale: Locale;
  tone?: "tint" | "overlay";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function KindBadge({ kind, locale, tone = "tint", size = "sm", className }: KindBadgeProps) {
  const { icon: Icon, dot, tint } = postKindMeta[kind];
  const label = blogContent[locale].kinds[kind].label;

  if (tone === "overlay") {
    return (
      <Badge
        size={size}
        className={cn(
          "bg-raised/92 text-ink shadow-card ring-1 ring-line/70 backdrop-blur-md",
          className,
        )}
      >
        <span aria-hidden className={cn("size-1.5 rounded-full", dot)} />
        {label}
      </Badge>
    );
  }

  return (
    <Badge size={size} className={cn(tint, className)}>
      <Icon aria-hidden />
      {label}
    </Badge>
  );
}
