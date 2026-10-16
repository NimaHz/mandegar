"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { m, type Variants } from "motion/react";
import type { Route } from "next";
import Link from "next/link";
import {
  type FocusEvent,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { ModelCodeText } from "@/components/shared/model-code-text";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/use-is-client";
import { useMediaQuery } from "@/hooks/use-media-query";
import { fill } from "@/i18n/fill";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { isRtl, swipeStep } from "@/lib/dom";
import { formatNumber } from "@/lib/format";
import type { HeroSlide } from "@/types/content";

import { homeContent } from "../content";
import { HeroImage } from "./hero-image";

export interface HeroCarouselSlide extends Omit<HeroSlide, "ctaHref"> {
  ctaHref: Route | null;
}

interface HeroCarouselProps {
  slides: HeroCarouselSlide[];
  secondaryHref: Route;
}

const AUTOPLAY_MS = 6500;

const textGroup: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};

const textLine: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE_OUT_EXPO } },
};

const maskedLine: Variants = {
  hidden: { y: "105%" },
  visible: { y: "0%", transition: { duration: 0.95, ease: EASE_OUT_EXPO } },
};

const subscribeVisibility = (onChange: () => void) => {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
};

const useDocumentHidden = () =>
  useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "hidden",
    () => false,
  );

const subscribeLoad = (onChange: () => void) => {
  window.addEventListener("load", onChange);
  return () => window.removeEventListener("load", onChange);
};

const usePageLoaded = () =>
  useSyncExternalStore(
    subscribeLoad,
    () => document.readyState === "complete",
    () => false,
  );

export function HeroCarousel({ slides, secondaryHref }: HeroCarouselProps) {
  const locale = useLocale();
  const { ui } = useDictionary();
  const content = homeContent[locale].hero;
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [seen, setSeen] = useState<ReadonlySet<number>>(() => new Set([0]));
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const hidden = useDocumentHidden();
  const pageLoaded = usePageLoaded();
  const isClient = useIsClient();
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [changed, setChanged] = useState(false);
  const canAutoplay = count > 1 && !reduceMotion;
  const running = canAutoplay && playing && !hovered && !focused && !hidden;
  const progressRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const animationRef = useRef<Animation | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

  const goTo = (target: number) => {
    const next = (target + count) % count;
    setIndex(next);
    setChanged(true);
    setSeen((current) =>
      current.has(next) && current.has((next + 1) % count)
        ? current
        : new Set([...current, next, (next + 1) % count]),
    );
  };

  const advance = useEffectEvent(() => goTo(index + 1));
  const isRunning = useEffectEvent(() => running);

  useEffect(() => {
    const bar = progressRefs.current[index];
    if (!bar || !canAutoplay) return;
    const animation = bar.animate([{ scale: "0 1" }, { scale: "1 1" }], {
      duration: AUTOPLAY_MS,
      easing: "linear",
      fill: "forwards",
    });
    animation.onfinish = () => advance();
    if (!isRunning()) animation.pause();
    animationRef.current = animation;
    return () => {
      animation.onfinish = null;
      animation.cancel();
      animationRef.current = null;
    };
  }, [index, canAutoplay]);

  useEffect(() => {
    const animation = animationRef.current;
    if (!animation) return;
    if (running) animation.play();
    else animation.pause();
  }, [running]);

  const step = (direction: 1 | -1) => goTo(index + direction);

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const forward = event.key === (isRtl(event.currentTarget) ? "ArrowLeft" : "ArrowRight");
    step(forward ? 1 : -1);
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary) return;
    pointerStart.current = { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || count < 2) return;
    const direction = swipeStep(
      event.currentTarget,
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (direction) step(direction);
  };

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
  };

  if (count === 0) return null;

  const active = slides[index] ?? slides[0];
  const upcoming = (index + 1) % count;
  const total = formatNumber(locale, count);
  const dark = active?.tone === "dark";
  const pad = (value: number) => formatNumber(locale, value, { minimumIntegerDigits: 2 });

  return (
    <section
      role="region"
      aria-roledescription={ui.carouselRole}
      aria-label={content.label}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        pointerStart.current = null;
      }}
      onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={(event) => event.pointerType === "mouse" && setHovered(false)}
      onFocus={(event) => setFocused(event.target.matches(":focus-visible"))}
      onBlur={onBlur}
      className={cn(
        "relative isolate aspect-4/5 touch-pan-y overflow-hidden bg-night outline-none select-none focus-visible:ring-3 focus-visible:ring-primary focus-visible:ring-inset sm:aspect-16/10 lg:aspect-auto lg:h-[min(78svh,44rem)] lg:min-h-[34rem]",
        dark ? "text-white" : "text-ink",
      )}
    >
      <div aria-live={running ? "off" : "polite"} className="absolute inset-0">
        {slides.map((slide, slideIndex) => {
          const isActive = slideIndex === index;
          return (
            <div
              key={slide.id}
              role="group"
              aria-roledescription={ui.carouselSlideRole}
              aria-label={fill(ui.carouselSlide, {
                current: formatNumber(locale, slideIndex + 1),
                total,
              })}
              aria-hidden={!isActive}
              inert={!isActive}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-(--ease-out-quart)",
                isActive ? "z-10 opacity-100" : "z-0 opacity-0",
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 will-change-transform",
                  isActive && isClient
                    ? "scale-100 transition-transform duration-[8000ms] ease-linear"
                    : "scale-[1.08] transition-transform delay-1000 duration-0",
                  reduceMotion && "scale-100 transition-none",
                )}
              >
                {(seen.has(slideIndex) || (pageLoaded && slideIndex === upcoming)) && (
                  <HeroImage slide={slide} priority={slideIndex === 0} />
                )}
              </div>
              <HeroOverlay tone={slide.tone} />
              {isActive && (
                <div className="absolute inset-0 flex items-end pb-28 sm:pb-32 lg:items-center lg:pb-16">
                  <div className="container-page">
                    <m.div
                      key={`text-${slideIndex}`}
                      variants={textGroup}
                      initial={changed && !reduceMotion ? "hidden" : false}
                      animate="visible"
                      className="flex max-w-2xl flex-col items-start gap-4 sm:gap-5"
                    >
                      <m.p
                        variants={textLine}
                        className={cn(
                          "inline-flex items-center gap-2 text-label font-bold",
                          slide.tone === "dark" ? "text-accent" : "text-primary",
                        )}
                      >
                        <span aria-hidden className="h-px w-8 bg-current" />
                        {fill(content.slideIndex, {
                          current: pad(slideIndex + 1),
                          total: pad(count),
                        })}
                      </m.p>
                      <h2 className="overflow-hidden pb-1 font-display text-[2rem] leading-[1.3] font-black text-balance sm:text-[2.75rem] lg:text-[3.5rem] lg:leading-[1.2]">
                        <m.span variants={maskedLine} className="block">
                          <ModelCodeText text={slide.title} />
                        </m.span>
                      </h2>
                      <m.p
                        variants={textLine}
                        className={cn(
                          "max-w-xl text-lead leading-8 font-medium text-pretty sm:text-lg sm:leading-9",
                          slide.tone === "dark" ? "text-white/85" : "text-ink-soft",
                        )}
                      >
                        {slide.subtitle}
                      </m.p>
                      <m.div variants={textLine} className="flex flex-wrap items-center gap-3 pt-1">
                        {slide.ctaHref && slide.ctaLabel && (
                          <Link
                            href={slide.ctaHref}
                            className={buttonVariants({
                              variant: slide.tone === "dark" ? "accent" : "primary",
                              size: "lg",
                              className: "group",
                            })}
                          >
                            {slide.ctaLabel}
                            <ArrowLeft
                              className="size-4.5 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                              aria-hidden
                            />
                          </Link>
                        )}
                        <Link
                          href={secondaryHref}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "lg" }),
                            "max-sm:hidden",
                            slide.tone === "dark"
                              ? "text-white ring-1 ring-white/30 hover:bg-white/10"
                              : "bg-surface/50 text-ink ring-1 ring-ink/15 backdrop-blur-sm hover:bg-surface/80",
                          )}
                        >
                          {content.secondaryCta}
                        </Link>
                      </m.div>
                    </m.div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-0 z-20 pb-8 sm:pb-10 lg:pb-20">
          <div className="container-page flex items-center gap-3 sm:gap-5">
            <div className="flex min-w-0 flex-1 items-stretch gap-2 lg:gap-4">
              {slides.map((slide, slideIndex) => {
                const isActive = slideIndex === index;
                const isPlayed = slideIndex < index;
                return (
                  <button
                    key={slide.id}
                    type="button"
                    onClick={() => goTo(slideIndex)}
                    aria-label={`${fill(ui.carouselGoTo, { current: pad(slideIndex + 1) })}: ${slide.title}`}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "group flex min-w-0 flex-1 flex-col gap-2 rounded-sm pt-2 pb-1 text-start outline-none focus-visible:ring-2 focus-visible:ring-current",
                      isActive ? "opacity-100" : "opacity-60 hover:opacity-90",
                    )}
                  >
                    <span className="flex min-w-0 items-baseline gap-2 text-xs font-bold drop-shadow-sm">
                      <span className="tabular-nums">{pad(slideIndex + 1)}</span>{" "}
                      <span className="truncate max-lg:hidden">{slide.title}</span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "relative block h-1 w-full overflow-hidden rounded-full shadow-sm",
                        dark ? "bg-white/30" : "bg-ink/20",
                      )}
                    >
                      <span
                        ref={(node) => {
                          progressRefs.current[slideIndex] = node;
                        }}
                        className={cn(
                          "absolute inset-0 rounded-full bg-current ltr:origin-left rtl:origin-right",
                          isPlayed || (isActive && !canAutoplay) ? "scale-x-100" : "scale-x-0",
                        )}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <HeroControl label={ui.carouselPrevious} onClick={() => step(-1)} dark={dark}>
                <ChevronRight className="size-4.5 ltr:rotate-180" aria-hidden />
              </HeroControl>
              {canAutoplay && (
                <HeroControl
                  label={playing ? ui.carouselPause : ui.carouselPlay}
                  onClick={() => setPlaying((value) => !value)}
                  dark={dark}
                >
                  {playing ? (
                    <Pause className="size-4" fill="currentColor" aria-hidden />
                  ) : (
                    <Play className="size-4" fill="currentColor" aria-hidden />
                  )}
                </HeroControl>
              )}
              <HeroControl label={ui.carouselNext} onClick={() => step(1)} dark={dark}>
                <ChevronLeft className="size-4.5 ltr:rotate-180" aria-hidden />
              </HeroControl>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function HeroOverlay({ tone }: { tone: HeroSlide["tone"] }) {
  const dark = tone === "dark";
  return (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 max-lg:hidden ltr:bg-linear-to-r rtl:bg-linear-to-l",
          dark
            ? "from-night/85 via-night/45 to-night/0"
            : "from-canvas/95 via-canvas/65 to-canvas/0",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 h-3/4 bg-linear-to-t lg:h-2/5",
          dark ? "from-night/90 via-night/45 to-night/0" : "from-canvas via-canvas/75 to-canvas/0",
        )}
      />
    </>
  );
}

interface HeroControlProps {
  label: string;
  onClick: () => void;
  dark: boolean;
  children: ReactNode;
}

function HeroControl({ label, onClick, dark, children }: HeroControlProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "grid size-10 place-items-center rounded-full ring-1 backdrop-blur-md transition-colors outline-none focus-visible:ring-2 sm:size-11",
        dark
          ? "bg-white/10 text-white ring-white/25 hover:bg-white/20 focus-visible:ring-white"
          : "bg-surface/60 text-ink ring-ink/15 hover:bg-surface focus-visible:ring-primary",
      )}
    >
      {children}
    </button>
  );
}
