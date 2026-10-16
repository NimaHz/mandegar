"use client";

import {
  CornerDownLeft,
  LayoutGrid,
  LoaderCircle,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { Portal } from "@/components/ui/portal";
import { useModal } from "@/hooks/use-modal";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { layoutContent } from "../content";
import { useSearchDialog } from "./use-search-dialog";
import { useSearchHits } from "./use-search-hits";

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export function SearchDialog() {
  const locale = useLocale();
  const { nav, common } = useDictionary();
  const { header } = layoutContent[locale];
  const isOpen = useSearchDialog((state) => state.isOpen);
  const open = useSearchDialog((state) => state.open);
  const close = useSearchDialog((state) => state.close);
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const { hits, loading, settled, searchable } = useSearchHits(query, locale);
  const highlighted = settled ? active : -1;

  const dismiss = () => {
    close();
    setQuery("");
    setActive(0);
  };

  useModal(dialogRef, isOpen, dismiss);

  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      const shortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
      if (shortcut || (event.key === "/" && !isEditable(event.target))) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const term = query.trim();
      if (!term) return;
      event.preventDefault();
      const hit = hits[highlighted];
      dismiss();
      router.push(
        hit
          ? (hit.href as Route)
          : (`${localizePath(locale, routes.products)}?q=${encodeURIComponent(term)}` as Route),
      );
      return;
    }
    if (!settled || !hits.length) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (current + step + hits.length) % hits.length);
    }
  };

  const shortcuts = [
    { href: routes.products, label: nav.allProducts, icon: LayoutGrid },
    { href: routes.warranty, label: nav.warranty, icon: ShieldCheck },
    { href: routes.serviceCenters, label: nav.serviceCenters, icon: MapPin },
  ];

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-70 flex items-start justify-center p-3 pt-[min(12vh,6rem)] sm:p-6 sm:pt-[min(14vh,8rem)]">
            <m.div
              aria-hidden
              onClick={dismiss}
              className="absolute inset-0 bg-night/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-label={header.searchTitle}
              tabIndex={-1}
              data-lenis-prevent
              className="relative flex max-h-[min(36rem,80dvh)] w-full max-w-2xl flex-col overflow-hidden panel shadow-lift outline-none"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center gap-3 border-b border-line px-4">
                {loading ? (
                  <LoaderCircle className="size-5 shrink-0 animate-spin text-primary" aria-hidden />
                ) : (
                  <Search className="size-5 shrink-0 text-muted" aria-hidden />
                )}
                <input
                  data-autofocus
                  type="search"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onInputKeyDown}
                  placeholder={common.searchPlaceholder}
                  aria-label={header.searchTitle}
                  aria-controls={listId}
                  aria-activedescendant={hits[highlighted] ? `${listId}-${highlighted}` : undefined}
                  role="combobox"
                  aria-expanded={hits.length > 0}
                  aria-autocomplete="list"
                  autoComplete="off"
                  enterKeyHint="search"
                  className="h-15 min-w-0 flex-1 bg-transparent text-lead text-ink outline-none [&::-webkit-search-cancel-button]:hidden"
                />
                <button
                  type="button"
                  onClick={dismiss}
                  aria-keyshortcuts="Escape"
                  className="rounded-md border border-line px-2 py-1 text-caption text-muted transition-colors hover:text-ink"
                >
                  <span className="sr-only">{header.closeSearch}</span>
                  <kbd className="font-code">Esc</kbd>
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto p-2" data-lenis-prevent>
                {!searchable && (
                  <div className="flex flex-col gap-3 p-2">
                    <p className="text-sm text-muted">{header.searchHint}</p>
                    <div className="flex flex-wrap gap-2">
                      {shortcuts.map(({ href, label, icon: Icon }) => (
                        <Link
                          key={href}
                          href={localizePath(locale, href)}
                          onClick={dismiss}
                          className="inline-flex h-9 items-center gap-2 rounded-full border border-line bg-raised px-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <Icon className="size-4" aria-hidden />
                          {label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {settled && hits.length === 0 && (
                  <p role="status" className="p-4 text-center text-sm text-muted">
                    {header.searchEmpty}
                  </p>
                )}
                {hits.length > 0 && (
                  <ul
                    id={listId}
                    role="listbox"
                    aria-label={header.searchTitle}
                    className={cn(
                      "flex flex-col gap-0.5 transition-opacity duration-300",
                      !settled && "opacity-60",
                    )}
                  >
                    {hits.map((hit, index) => (
                      <li
                        key={`${hit.kind}-${hit.href}`}
                        id={`${listId}-${index}`}
                        role="option"
                        aria-selected={index === highlighted}
                      >
                        <Link
                          href={hit.href as Route}
                          onClick={dismiss}
                          onMouseEnter={() => setActive(index)}
                          className={cn(
                            "flex items-center gap-3 rounded-field p-2 transition-colors",
                            index === highlighted ? "bg-primary-soft" : "hover:bg-sunken",
                          )}
                        >
                          <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-control bg-sunken">
                            {hit.image ? (
                              <Image
                                src={hit.image.src}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <Search className="size-4 text-muted" aria-hidden />
                            )}
                          </span>
                          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                            <span className="truncate text-sm font-bold text-ink">{hit.title}</span>
                            <span className="truncate text-xs text-muted">{hit.subtitle}</span>
                          </span>
                          <span className="shrink-0 rounded-full bg-chip px-2 py-0.5 text-caption font-semibold text-ink-soft">
                            {header.searchKinds[hit.kind]}
                          </span>
                          {index === highlighted && (
                            <CornerDownLeft
                              className="size-4 shrink-0 text-primary max-sm:hidden"
                              aria-hidden
                            />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
