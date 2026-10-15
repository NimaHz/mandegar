"use client";

import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import { type KeyboardEvent, type PointerEvent, useRef, useState } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { Portal } from "@/components/ui/portal";
import { useModal } from "@/hooks/use-modal";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { isRtl, swipeStep } from "@/lib/dom";
import { formatNumber } from "@/lib/format";
import type { ImageAsset } from "@/types/common";

import { productContent } from "../content";

interface ProductLightboxProps {
  images: ImageAsset[];
  index: number;
  open: boolean;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

const ZOOM_SCALE = 2.4;
const TAP_DISTANCE = 8;

interface ZoomState {
  active: boolean;
  x: number;
  y: number;
}

const resting: ZoomState = { active: false, x: 50, y: 50 };

export function ProductLightbox({
  images,
  index,
  open,
  onIndexChange,
  onClose,
}: ProductLightboxProps) {
  const locale = useLocale();
  const { gallery } = productContent[locale];
  const dialogRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number; down: boolean }>({ x: 0, y: 0, down: false });
  const [zoom, setZoom] = useState<ZoomState>(resting);
  const count = images.length;
  const active = images[index];
  const total = formatNumber(locale, count);

  useModal(dialogRef, open, onClose);

  const goTo = (target: number) => {
    setZoom(resting);
    onIndexChange((target + count) % count);
  };

  const originFrom = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.min(100, Math.max(0, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pointer.current = { x: event.clientX, y: event.clientY, down: true };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!zoom.active || (event.pointerType !== "mouse" && !pointer.current.down)) return;
    setZoom({ active: true, ...originFrom(event) });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const dx = event.clientX - pointer.current.x;
    const dy = event.clientY - pointer.current.y;
    pointer.current.down = false;
    const moved = Math.hypot(dx, dy);
    if (moved < TAP_DISTANCE) {
      const origin = originFrom(event);
      setZoom((current) => (current.active ? resting : { active: true, ...origin }));
      return;
    }
    if (zoom.active || count < 2) return;
    const direction = swipeStep(event.currentTarget, dx, dy);
    if (direction) goTo(index + direction);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      const forward = event.key === (isRtl(event.currentTarget) ? "ArrowLeft" : "ArrowRight");
      goTo(index + (forward ? 1 : -1));
    } else if (event.key === "+" || event.key === "=") {
      setZoom((current) => ({ ...current, active: true }));
    } else if (event.key === "-") {
      setZoom(resting);
    }
  };

  const controlClass =
    "grid size-11 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 transition-colors outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white";

  return (
    <Portal>
      <AnimatePresence>
        {open && active && (
          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={gallery.label}
            tabIndex={-1}
            onKeyDown={onKeyDown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-80 flex flex-col bg-night/96 text-white backdrop-blur-sm outline-none"
          >
            <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <p className="font-code text-sm font-bold text-white/80" aria-live="polite">
                {fill(gallery.counter, { current: formatNumber(locale, index + 1), total })}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom(zoom.active ? resting : { ...resting, active: true })}
                  aria-label={zoom.active ? gallery.zoomOut : gallery.zoomIn}
                  aria-pressed={zoom.active}
                  className={controlClass}
                >
                  {zoom.active ? (
                    <ZoomOut className="size-5" aria-hidden />
                  ) : (
                    <ZoomIn className="size-5" aria-hidden />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={gallery.close}
                  data-autofocus
                  className={controlClass}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1">
              <div
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={() => {
                  pointer.current.down = false;
                }}
                className={cn(
                  "absolute inset-0 overflow-hidden select-none",
                  zoom.active ? "cursor-zoom-out touch-none" : "cursor-zoom-in touch-pan-y",
                )}
              >
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-(--ease-out-quart)"
                  style={{
                    transform: `scale(${zoom.active ? ZOOM_SCALE : 1})`,
                    transformOrigin: `${zoom.x}% ${zoom.y}%`,
                  }}
                >
                  <Image
                    key={active.src}
                    src={active.src}
                    alt={active.alt}
                    fill
                    sizes="100vw"
                    className="animate-fade object-contain p-2 sm:p-8"
                    draggable={false}
                  />
                </div>
              </div>
              {count > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goTo(index - 1)}
                    aria-label={gallery.previous}
                    className={cn(
                      controlClass,
                      "absolute start-3 top-1/2 -translate-y-1/2 sm:start-6",
                    )}
                  >
                    <ChevronRight className="size-5 ltr:rotate-180" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(index + 1)}
                    aria-label={gallery.next}
                    className={cn(controlClass, "absolute end-3 top-1/2 -translate-y-1/2 sm:end-6")}
                  >
                    <ChevronLeft className="size-5 ltr:rotate-180" aria-hidden />
                  </button>
                </>
              )}
            </div>

            {count > 1 && (
              <ul
                aria-label={gallery.thumbnails}
                className="scrollbar-none flex justify-center gap-2 overflow-x-auto px-4 pb-safe pt-3"
              >
                {images.map((image, imageIndex) => (
                  <li key={image.src} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => goTo(imageIndex)}
                      aria-label={fill(gallery.image, {
                        current: formatNumber(locale, imageIndex + 1),
                        total,
                      })}
                      aria-current={imageIndex === index ? "true" : undefined}
                      className={cn(
                        "relative block size-14 overflow-hidden rounded-control ring-2 transition-opacity outline-none focus-visible:ring-white",
                        imageIndex === index
                          ? "ring-accent"
                          : "opacity-55 ring-transparent hover:opacity-100",
                      )}
                    >
                      <Image src={image.src} alt="" fill sizes="56px" className="object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
