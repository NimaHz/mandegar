import type { LucideIcon } from "lucide-react";
import { BookOpenText, Lightbulb, Newspaper } from "lucide-react";

import type { PostKind } from "@/types/content";

interface KindMeta {
  icon: LucideIcon;
  dot: string;
  tint: string;
}

export const postKindMeta: Record<PostKind, KindMeta> = {
  guide: { icon: BookOpenText, dot: "bg-primary", tint: "bg-primary-soft text-primary" },
  news: { icon: Newspaper, dot: "bg-accent", tint: "bg-warning-soft text-warning" },
  tips: { icon: Lightbulb, dot: "bg-success", tint: "bg-success-soft text-success" },
};
