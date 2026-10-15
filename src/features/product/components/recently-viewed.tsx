"use client";

import { History, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { Locale } from "@/i18n/config";
import { useLocale } from "@/i18n/locale-provider";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { useStoresHydrated } from "@/stores/hydration";
import { useRecentlyViewedStore } from "@/stores/recently-viewed";
import type { ProductListItem } from "@/types/catalog";

import { productContent } from "../content";

interface RecentlyViewedProps {
  current: string;
}

interface Loaded {
  key: string;
  items: ProductListItem[];
}

const VISIBLE = 6;

const loadRecent = async (locale: Locale, key: string, signal: AbortSignal) => {
  const params = new URLSearchParams({ slugs: key, locale });
  const response = await fetch(`/api/products?${params}`, { signal });
  const data: { items?: ProductListItem[] } = response.ok ? await response.json() : {};
  return data.items ?? [];
};

export function RecentlyViewed({ current }: RecentlyViewedProps) {
  const locale = useLocale();
  const { recent } = productContent[locale];
  const hydrated = useStoresHydrated();
  const slugs = useRecentlyViewedStore((state) => state.slugs);
  const add = useRecentlyViewedStore((state) => state.add);
  const clear = useRecentlyViewedStore((state) => state.clear);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const others = slugs.filter((slug) => slug !== current).slice(0, VISIBLE);
  const key = hydrated ? others.join(",") : "";

  useEffect(() => {
    if (hydrated) add(current);
  }, [hydrated, current, add]);

  useEffect(() => {
    if (!key) return;
    const controller = new AbortController();
    loadRecent(locale, key, controller.signal)
      .then((items) => setLoaded({ key, items }))
      .catch(() => undefined);
    return () => controller.abort();
  }, [key, locale]);

  const known = new Map((loaded?.items ?? []).map((item) => [item.slug, item]));
  const items = key
    ? others.flatMap((slug) => {
        const item = known.get(slug);
        return item ? [item] : [];
      })
    : [];

  if (!hydrated || items.length === 0) return null;

  return (
    <section aria-labelledby="recently-viewed" className="container-page pb-16">
      <div className="flex flex-col gap-5 panel p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="icon-tile size-10">
              <History className="size-5" aria-hidden />
            </span>
            <div className="flex flex-col">
              <p className="text-caption font-bold text-primary">{recent.eyebrow}</p>
              <h2 id="recently-viewed" className="text-base font-extrabold text-ink">
                {recent.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              clear();
              add(current);
            }}
            className="h-9 rounded-control px-3 text-label font-bold text-muted transition-colors hover:bg-sunken hover:text-ink"
          >
            {recent.clear}
          </button>
        </div>
        <ul className="-mx-1 scrollbar-none flex gap-3 overflow-x-auto px-1 pb-1">
          {items.map((item) => (
            <li key={item.slug} className="w-60 shrink-0">
              <Link
                href={localizePath(locale, routes.product(item.slug))}
                className="group flex items-center gap-3 rounded-field border border-line bg-raised p-2 pe-3 transition-colors hover:border-primary"
              >
                <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-control bg-sunken text-subtle">
                  {item.image ? (
                    <Image src={item.image.src} alt="" fill sizes="56px" className="object-cover" />
                  ) : (
                    <Package className="size-5" aria-hidden />
                  )}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-caption font-bold text-primary">
                    {item.category.name}
                  </span>
                  <span className="truncate text-sm font-extrabold text-ink group-hover:text-primary">
                    {item.name}
                  </span>
                  <bdi dir="ltr" className="self-start font-code text-xs text-muted">
                    {item.modelCode}
                  </bdi>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
