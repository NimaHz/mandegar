import Image from "next/image";

import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/cn";
import type { ImageAsset } from "@/types/common";
import type { PostKind } from "@/types/content";

import { postKindMeta } from "../config";

interface CoverArtProps {
  cover: ImageAsset | null;
  kind: PostKind;
  sizes: string;
  alt?: string;
  priority?: boolean;
  className?: string;
}

export function CoverArt({ cover, kind, sizes, alt = "", priority, className }: CoverArtProps) {
  const { icon: Icon } = postKindMeta[kind];

  return (
    <div className={cn("relative overflow-hidden bg-sunken", className)}>
      {cover ? (
        <Image
          src={cover.src}
          alt={alt}
          fill
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.04]"
        />
      ) : (
        <div aria-hidden className="bg-dots absolute inset-0 isolate grid place-items-center">
          <LogoMark tone="mono" className="absolute -end-10 -bottom-12 size-48 text-primary/10" />
          <span className="icon-tile size-14 rounded-card bg-raised shadow-card ring-1 ring-line">
            <Icon className="size-6" strokeWidth={1.7} />
          </span>
        </div>
      )}
    </div>
  );
}
