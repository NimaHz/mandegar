import { ImageOff } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import type { AdminMediaRef } from "@/types/admin";

import { MediaThumb } from "../media/media-thumb";

interface ThumbCellProps {
  media: AdminMediaRef | null;
  title: string;
  href?: Route;
  subtitle?: ReactNode;
  square?: boolean;
  fit?: "cover" | "contain";
}

export function ThumbCell({
  media,
  title,
  href,
  subtitle,
  square = true,
  fit = "cover",
}: ThumbCellProps) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span
        className={cn(
          "relative shrink-0 overflow-hidden rounded-control border border-line bg-sunken",
          square ? "size-12" : "h-12 w-20",
        )}
      >
        {media ? (
          <MediaThumb media={media} sizes="5rem" fit={fit} />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-subtle">
            <ImageOff className="size-4.5" aria-hidden />
          </span>
        )}
      </span>
      <span className="flex min-w-0 flex-col gap-0.5">
        {href ? (
          <Link
            href={href}
            className="truncate text-sm font-extrabold text-ink transition-colors hover:text-primary"
          >
            {title}
          </Link>
        ) : (
          <span className="truncate text-sm font-extrabold text-ink">{title}</span>
        )}
        {subtitle && <span className="truncate text-caption text-muted">{subtitle}</span>}
      </span>
    </div>
  );
}

export function CodeText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <bdi dir="ltr" className={cn("font-code text-[0.8125em] tracking-tight", className)}>
      {children}
    </bdi>
  );
}
