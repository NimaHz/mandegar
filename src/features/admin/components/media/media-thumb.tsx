import { FileText, Film } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import type { AdminMediaRef } from "@/types/admin";

interface MediaThumbProps {
  media: AdminMediaRef;
  sizes: string;
  className?: string;
  fit?: "cover" | "contain";
}

export function MediaThumb({ media, sizes, className, fit = "cover" }: MediaThumbProps) {
  if (media.kind === "image")
    return (
      <Image
        src={media.url}
        alt={media.alt.fa}
        fill
        sizes={sizes}
        className={cn(fit === "cover" ? "object-cover" : "object-contain", className)}
      />
    );
  const Icon = media.kind === "video" ? Film : FileText;
  return (
    <span
      className={cn("absolute inset-0 grid place-items-center bg-sunken text-muted", className)}
    >
      <Icon className="size-7" strokeWidth={1.6} aria-hidden />
    </span>
  );
}
