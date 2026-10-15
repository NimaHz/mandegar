"use client";

import { Expand, ImageOff } from "lucide-react";
import Image from "next/image";
import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { isRtl, swipeStep } from "@/lib/dom";
import { formatNumber } from "@/lib/format";
import type { ImageAsset } from "@/types/common";

import { productContent } from "../content";
import { ProductLightbox } from "./product-lightbox";

interface ProductGalleryProps {
  images: ImageAsset[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const locale = useLocale();
  const { gallery } = productContent[locale];
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const pointerStart = useRef<number | null>(null);
  const swiped = useRef(false);
  const count = images.length;
  const total = formatNumber(locale, count);
  const active = images[index] ?? images[0];

  const goTo = (target: number) => setIndex((target + count) % count);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (count < 2 || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const forward = event.key === (isRtl(event.currentTarget) ? "ArrowLeft" : "ArrowRight");
    const next = (index + (forward ? 1 : -1) + count) % count;
    setIndex(next);
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-thumb="${next}"]`)
      ?.focus({ preventScroll: true });
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointerStart.current = event.clientX;
    swiped.current = false;
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (start === null || count < 2) return;
    const direction = swipeStep(event.currentTarget, event.clientX - start);
    if (!direction) return;
    swiped.current = true;
    goTo(index + direction);
  };

  if (!active) {
    return (
      <div className="grid aspect-square place-items-center rounded-panel bg-sunken text-subtle sm:aspect-5/4">
        <ImageOff className="size-12" strokeWidth={1.3} aria-hidden />
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label={gallery.label}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-3"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        className="relative isolate aspect-square touch-pan-y overflow-hidden rounded-panel bg-sunken select-none sm:aspect-5/4"
      >
        <Image
          src={active.src}
          alt=""
          aria-hidden
          fill
          sizes="96px"
          loading="eager"
          className="-z-10 scale-125 object-cover opacity-40 blur-2xl"
        />
        <Image
          key={active.src}
          src={active.src}
          alt={active.alt}
          fill
          sizes="(min-width: 1280px) 640px, (min-width: 1024px) 52vw, 100vw"
          loading={index === 0 ? "eager" : "lazy"}
          fetchPriority={index === 0 ? "high" : "auto"}
          className="animate-fade object-contain"
        />
        <button
          type="button"
          onClick={() => {
            if (!swiped.current) setOpen(true);
          }}
          aria-label={gallery.open}
          aria-haspopup="dialog"
          className="group absolute inset-0 cursor-zoom-in rounded-panel outline-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-inset"
        >
          <span
            aria-hidden
            className="absolute end-4 top-4 grid size-10 place-items-center rounded-full bg-raised/85 text-ink shadow-card backdrop-blur transition-transform duration-300 group-hover:scale-110"
          >
            <Expand className="size-4.5" />
          </span>
        </button>
        {count > 1 && (
          <span
            aria-hidden
            className="absolute start-4 bottom-4 rounded-full bg-night/60 px-2.5 py-1 font-code text-xs font-bold text-white backdrop-blur"
          >
            {fill(gallery.counter, { current: formatNumber(locale, index + 1), total })}
          </span>
        )}
        <span role="status" className="sr-only">
          {fill(gallery.image, { current: formatNumber(locale, index + 1), total })}
        </span>
      </div>

      {count > 1 && (
        <ul
          aria-label={gallery.thumbnails}
          className="scrollbar-none flex gap-2.5 overflow-x-auto p-0.5"
        >
          {images.map((image, imageIndex) => {
            const isActive = imageIndex === index;
            return (
              <li key={image.src} className="shrink-0">
                <button
                  type="button"
                  data-thumb={imageIndex}
                  onClick={() => setIndex(imageIndex)}
                  aria-label={fill(gallery.image, {
                    current: formatNumber(locale, imageIndex + 1),
                    total,
                  })}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative block size-16 overflow-hidden rounded-field bg-sunken ring-2 transition-[box-shadow,opacity] outline-none focus-visible:ring-primary sm:size-20",
                    isActive ? "ring-primary" : "opacity-70 ring-transparent hover:opacity-100",
                  )}
                >
                  <Image
                    src={image.src}
                    alt=""
                    fill
                    sizes="80px"
                    loading="eager"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <ProductLightbox
        images={images}
        index={index}
        open={open}
        onIndexChange={setIndex}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}
