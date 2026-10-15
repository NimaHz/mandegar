"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Children, type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from "react";

import { fill } from "@/i18n/fill";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";

interface CarouselProps {
  children: ReactNode;
  label: string;
  slideClassName?: string;
  className?: string;
}

const VISIBLE_RATIO = 0.75;

const scrollBehavior = (): ScrollBehavior =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

const isRtl = (element: HTMLElement) => getComputedStyle(element).direction === "rtl";

export function Carousel({
  children,
  label,
  slideClassName = "basis-full",
  className,
}: CarouselProps) {
  const locale = useLocale();
  const { ui } = useDictionary();
  const slides = Children.toArray(children);
  const count = slides.length;
  const total = formatNumber(locale, count);

  const viewportRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visible, setVisible] = useState<ReadonlySet<number>>(() => new Set([0]));

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const ratios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          ratios.set(Number((entry.target as HTMLElement).dataset.index), entry.intersectionRatio);
        }
        const next = new Set<number>();
        for (const [index, ratio] of ratios) if (ratio >= VISIBLE_RATIO) next.add(index);
        setVisible((current) =>
          current.size === next.size && [...next].every((index) => current.has(index))
            ? current
            : next,
        );
      },
      { root: viewport, threshold: [0, VISIBLE_RATIO, 1] },
    );

    for (const slide of slideRefs.current.slice(0, count)) if (slide) observer.observe(slide);
    return () => observer.disconnect();
  }, [count]);

  const step = (direction: 1 | -1) => {
    const viewport = viewportRef.current;
    const first = slideRefs.current[0];
    if (!viewport || !first) return;
    const gap = parseFloat(getComputedStyle(viewport).columnGap) || 0;
    const distance = (first.offsetWidth + gap) * direction;
    viewport.scrollBy({ left: isRtl(viewport) ? -distance : distance, behavior: scrollBehavior() });
  };

  const goTo = (index: number) => {
    const viewport = viewportRef.current;
    const slide = slideRefs.current[index];
    if (!viewport || !slide) return;
    const padding = parseFloat(getComputedStyle(viewport).paddingInlineStart) || 0;
    const viewportRect = viewport.getBoundingClientRect();
    const slideRect = slide.getBoundingClientRect();
    const delta = isRtl(viewport)
      ? slideRect.right - (viewportRect.right - padding)
      : slideRect.left - (viewportRect.left + padding);
    viewport.scrollBy({ left: delta, behavior: scrollBehavior() });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = isRtl(event.currentTarget);
    switch (event.key) {
      case "ArrowLeft":
        step(rtl ? 1 : -1);
        break;
      case "ArrowRight":
        step(rtl ? -1 : 1);
        break;
      case "Home":
        goTo(0);
        break;
      case "End":
        goTo(count - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  const atStart = count === 0 || visible.has(0);
  const atEnd = count === 0 || visible.has(count - 1);
  const scrollable = !(atStart && atEnd);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={cn("flex flex-col gap-5", className)}
    >
      <div
        ref={viewportRef}
        tabIndex={scrollable ? 0 : -1}
        onKeyDown={onKeyDown}
        className="-mx-1 -my-4 scrollbar-none flex snap-x snap-mandatory scroll-px-1 gap-4 overflow-x-auto overscroll-x-contain px-1 py-4 outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            data-index={index}
            role="group"
            aria-roledescription="slide"
            aria-label={fill(ui.carouselSlide, { current: formatNumber(locale, index + 1), total })}
            className={cn("min-w-0 shrink-0 grow-0 snap-start", slideClassName)}
          >
            {slide}
          </div>
        ))}
      </div>

      {scrollable && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            {slides.map((_, index) => {
              const active = visible.has(index);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => goTo(index)}
                  aria-label={fill(ui.carouselGoTo, { current: formatNumber(locale, index + 1) })}
                  aria-current={active ? "true" : undefined}
                  className="group grid h-6 place-items-center rounded-full px-0.5 outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <span
                    aria-hidden
                    className={cn(
                      "block h-1.5 rounded-full transition-[width,background-color] duration-500 ease-(--ease-out-expo)",
                      active ? "w-5 bg-primary" : "w-1.5 bg-line-strong group-hover:bg-muted",
                    )}
                  />
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label={ui.carouselPrevious}
              className="icon-btn size-10 border border-line bg-surface shadow-card outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="size-4.5 ltr:rotate-180" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label={ui.carouselNext}
              className="icon-btn size-10 border border-line bg-surface shadow-card outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="size-4.5 ltr:rotate-180" aria-hidden />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
