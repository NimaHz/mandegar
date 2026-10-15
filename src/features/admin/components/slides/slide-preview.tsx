import { ArrowLeft, ImageOff } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/cn";
import type { AdminMediaRef, SlideTone } from "@/types/admin";

interface SlidePreviewProps {
  image: AdminMediaRef | null;
  title: string;
  subtitle: string;
  cta: string;
  tone: SlideTone;
  className?: string;
}

export function SlidePreview({ image, title, subtitle, cta, tone, className }: SlidePreviewProps) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "relative isolate aspect-[16/7] overflow-hidden rounded-field bg-brand-deep",
        className,
      )}
    >
      {image ? (
        <Image
          src={image.url}
          alt=""
          fill
          sizes="(min-width: 640px) 36rem, 90vw"
          className="-z-10 object-cover"
        />
      ) : (
        <span className="absolute inset-0 -z-10 grid place-items-center text-white/40">
          <ImageOff className="size-8" aria-hidden />
        </span>
      )}
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-l",
          dark
            ? "from-black/65 via-black/25 to-transparent"
            : "from-white/80 via-white/30 to-transparent",
        )}
      />
      <div className="flex h-full max-w-[70%] flex-col justify-center gap-1.5 p-4 sm:p-6">
        <p
          className={cn(
            "line-clamp-2 font-display text-base leading-tight font-black sm:text-xl",
            dark ? "text-white" : "text-night",
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "line-clamp-2 text-[0.6875rem] leading-5 sm:text-xs",
            dark ? "text-white/80" : "text-night/75",
          )}
        >
          {subtitle}
        </p>
        {cta && (
          <span className="mt-1 inline-flex h-7 items-center gap-1 self-start rounded-lg bg-accent px-3 text-[0.6875rem] font-bold text-on-accent">
            {cta}
            <ArrowLeft className="size-3" aria-hidden />
          </span>
        )}
      </div>
    </div>
  );
}
