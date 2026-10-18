import Image from "next/image";

import { blurProps, FULL_WIDTH_SIZES } from "@/lib/image";
import type { HeroSlide } from "@/types/content";

interface HeroImageProps {
  slide: Pick<HeroSlide, "image" | "mobileImage">;
  priority: boolean;
}

export function HeroImage({ slide, priority }: HeroImageProps) {
  const loading = priority ? "eager" : "lazy";
  const fetchPriority = priority ? "high" : "auto";

  if (!slide.mobileImage) {
    return (
      <Image
        src={slide.image.src}
        {...blurProps(slide.image)}
        alt={slide.image.alt}
        fill
        sizes={FULL_WIDTH_SIZES}
        loading={loading}
        fetchPriority={fetchPriority}
        className="object-cover"
      />
    );
  }

  return (
    <>
      <Image
        src={slide.mobileImage.src}
        {...blurProps(slide.mobileImage)}
        alt={slide.mobileImage.alt || slide.image.alt}
        fill
        sizes={`(min-width: 40rem) 1px, ${FULL_WIDTH_SIZES}`}
        loading={loading}
        fetchPriority={fetchPriority}
        className="object-cover sm:hidden"
      />
      <Image
        src={slide.image.src}
        {...blurProps(slide.image)}
        alt={slide.image.alt}
        fill
        sizes="(min-width: 40rem) 100vw, 1px"
        loading={loading}
        fetchPriority={fetchPriority}
        className="object-cover max-sm:hidden"
      />
    </>
  );
}
