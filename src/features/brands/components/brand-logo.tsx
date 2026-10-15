import Image from "next/image";

import { LogoMark } from "@/components/brand/logo-mark";
import { cn } from "@/lib/cn";
import type { BrandSummary } from "@/types/catalog";

interface BrandLogoProps {
  brand: Pick<BrandSummary, "name" | "logo" | "isOwn">;
  sizes: string;
  className?: string;
}

export function BrandLogo({ brand, sizes, className }: BrandLogoProps) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-raised ring-1 ring-line",
        className,
      )}
    >
      {brand.isOwn ? (
        <LogoMark className="size-3/4" />
      ) : brand.logo ? (
        <Image src={brand.logo.src} alt="" fill sizes={sizes} className="object-cover" />
      ) : (
        <span aria-hidden className="font-display text-xl font-black text-ink">
          {brand.name.slice(0, 1)}
        </span>
      )}
    </span>
  );
}
