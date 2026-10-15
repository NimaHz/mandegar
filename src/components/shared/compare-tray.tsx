"use client";

import { ArrowLeft, GitCompareArrows, Info, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { EASE_OUT_EXPO, springSnappy } from "@/components/motion/easing";
import { buttonVariants } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { pluralize } from "@/features/catalog/plural";
import { compareContent } from "@/features/compare/content";
import { compareHref } from "@/features/compare/href";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { COMPARE_LIMIT, useCompareStore } from "@/stores/compare";
import { useStoresHydrated } from "@/stores/hydration";
import type { ProductListItem } from "@/types/catalog";

export type CompareTrayItem = Pick<ProductListItem, "slug" | "name" | "modelCode" | "image">;

interface CompareTrayProps {
  products?: CompareTrayItem[];
}

const NOTICE_MS = 5000;

const fallbackCode = (slug: string) => slug.toUpperCase();

export function CompareTray({ products = [] }: CompareTrayProps) {
  const locale = useLocale();
  const { tray } = compareContent[locale];
  const hydrated = useStoresHydrated();
  const slugs = useCompareStore((state) => state.slugs);
  const remove = useCompareStore((state) => state.remove);
  const clear = useCompareStore((state) => state.clear);
  const limitNotice = useCompareStore((state) => state.limitNotice);
  const dismissLimitNotice = useCompareStore((state) => state.dismissLimitNotice);
  const visible = hydrated && slugs.length > 0;
  const known = new Map(products.map((product) => [product.slug, product]));
  const slots = Array.from({ length: COMPARE_LIMIT }, (_, index) => slugs[index] ?? null);

  useEffect(() => {
    if (limitNotice === 0) return;
    const timer = window.setTimeout(dismissLimitNotice, NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [limitNotice, dismissLimitNotice]);

  useEffect(() => dismissLimitNotice, [dismissLimitNotice]);

  return (
    <Portal>
      <AnimatePresence>
        {visible && (
          <m.aside
            aria-label={tray.label}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="fixed inset-x-3 bottom-[calc(5.75rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-2xl lg:start-auto lg:end-6 lg:bottom-6 lg:mx-0 lg:w-[min(40rem,calc(100vw-28rem))]"
          >
            <div
              className={cn(
                "rounded-panel border bg-raised/95 shadow-lift backdrop-blur-xl transition-colors duration-300",
                limitNotice > 0 ? "border-primary" : "border-line-strong",
              )}
            >
              <div role="status">
                <AnimatePresence initial={false}>
                  {limitNotice > 0 && (
                    <m.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 border-b border-line p-2.5 sm:px-3 sm:pt-3">
                        <span
                          key={limitNotice}
                          className="icon-tile size-9 bg-primary-soft text-primary motion-safe:animate-wiggle"
                        >
                          <Info className="size-4.5" aria-hidden />
                        </span>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <p className="text-sm font-extrabold text-ink">{tray.fullTitle}</p>
                          <p className="text-xs leading-5 text-pretty text-muted">
                            {fill(tray.fullDescription, {
                              count: formatNumber(locale, COMPARE_LIMIT),
                            })}
                          </p>
                        </div>
                      </div>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center gap-3 p-2.5 sm:gap-4 sm:p-3">
                <ul className="flex shrink-0 items-center -space-x-2 sm:space-x-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {slots.map((slug, index) =>
                      slug ? (
                        <m.li
                          key={slug}
                          layout
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={springSnappy}
                          className="group/slot relative"
                        >
                          <TraySlot product={known.get(slug)} slug={slug} />
                          <button
                            type="button"
                            onClick={() => remove(slug)}
                            aria-label={fill(tray.remove, {
                              name: known.get(slug)?.name ?? fallbackCode(slug),
                            })}
                            className="absolute -end-1.5 -top-1.5 grid size-5.5 place-items-center rounded-full bg-inverse text-on-inverse shadow-card transition-transform hover:scale-110 max-sm:hidden"
                          >
                            <X className="size-3" strokeWidth={2.6} aria-hidden />
                          </button>
                        </m.li>
                      ) : (
                        <li
                          key={`empty-${index}`}
                          className="grid size-11 place-items-center rounded-control border border-dashed border-line-strong bg-surface text-subtle max-sm:hidden sm:size-12"
                        >
                          <span className="sr-only">{tray.emptySlot}</span>
                          <GitCompareArrows className="size-4" aria-hidden />
                        </li>
                      ),
                    )}
                  </AnimatePresence>
                </ul>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p
                    className="truncate text-sm font-extrabold text-ink max-sm:sr-only"
                    role="status"
                  >
                    {pluralize(locale, slugs.length, tray.title)}
                  </p>
                  <p className="truncate text-xs text-muted max-sm:hidden">
                    {fill(tray.hint, { count: formatNumber(locale, COMPARE_LIMIT) })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={clear}
                  className="h-10 shrink-0 rounded-control px-2.5 text-label font-bold text-muted transition-colors hover:bg-sunken hover:text-ink sm:px-3"
                >
                  {tray.clear}
                </button>
                <Link
                  href={compareHref(locale, slugs)}
                  className={buttonVariants({ size: "md", className: "group h-10 px-4 sm:h-11" })}
                >
                  {tray.compare}
                  <ArrowLeft
                    className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </m.aside>
        )}
      </AnimatePresence>
    </Portal>
  );
}

function TraySlot({ product, slug }: { product: CompareTrayItem | undefined; slug: string }) {
  return (
    <span
      className="relative grid size-11 place-items-center overflow-hidden rounded-control border-2 border-raised bg-sunken shadow-card sm:size-12"
      title={product?.name ?? fallbackCode(slug)}
    >
      {product?.image ? (
        <Image src={product.image.src} alt="" fill sizes="48px" className="object-cover" />
      ) : (
        <bdi
          dir="ltr"
          className="px-1 text-center font-code text-2xs leading-tight font-bold text-ink-soft"
        >
          {product?.modelCode ?? fallbackCode(slug)}
        </bdi>
      )}
    </span>
  );
}
