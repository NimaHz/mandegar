"use client";

import { ArrowLeft, ShieldCheck, X } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { Logo } from "@/components/brand/logo";
import { CategoryIcon } from "@/components/icons/category-icon";
import { SocialIcon, type SocialPlatform } from "@/components/icons/social-icon";
import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { InstallAppButton } from "@/components/pwa/install-app-button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { Portal } from "@/components/ui/portal";
import { isNavActive, type NavItem, primaryNav, supportNav } from "@/config/navigation";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useModal } from "@/hooks/use-modal";
import { localeMeta } from "@/i18n/config";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { localizePath, stripLocalePrefix } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import { useUiStore } from "@/stores/ui";
import type { CategorySummary } from "@/types/catalog";

import { layoutContent } from "../content";
import { MOBILE_MENU_ID } from "./mobile-menu-id";

interface MobileMenuProps {
  categories: Pick<CategorySummary, "slug" | "name" | "icon">[];
  socials: { platform: SocialPlatform; href: string; label: string }[];
}

const rowClass = (active: boolean) =>
  cn(
    "flex h-12 items-center gap-3 rounded-field px-3 text-lead transition-colors",
    active ? "bg-primary-soft font-bold text-primary" : "font-semibold text-ink hover:bg-raised",
  );

function MenuSection({ title, items }: { title: string; items: NavItem[] }) {
  const locale = useLocale();
  const { nav } = useDictionary();
  const pathname = stripLocalePrefix(usePathname());
  const closeMenu = useUiStore((state) => state.closeMenu);

  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-1 text-xs font-bold text-muted">{title}</p>
      {items.map((item) => {
        const isActive = isNavActive(pathname, item);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={localizePath(locale, item.href)}
            onClick={closeMenu}
            aria-current={isActive ? "page" : undefined}
            className={rowClass(isActive)}
          >
            <Icon className="size-5" strokeWidth={1.8} aria-hidden />
            {nav[item.label]}
          </Link>
        );
      })}
    </div>
  );
}

export function MobileMenu({ categories, socials }: MobileMenuProps) {
  const locale = useLocale();
  const { nav, ui } = useDictionary();
  const { mobileMenu, header, homeLabel, footer } = layoutContent[locale];
  const pathname = stripLocalePrefix(usePathname());
  const isOpen = useUiStore((state) => state.isMenuOpen);
  const closeMenu = useUiStore((state) => state.closeMenu);
  const isDesktop = useMediaQuery("(min-width: 64rem)");
  const dialogRef = useRef<HTMLDivElement>(null);
  const offset = localeMeta[locale].dir === "rtl" ? "100%" : "-100%";

  useModal(dialogRef, isOpen, closeMenu);

  useEffect(() => {
    if (isDesktop) closeMenu();
  }, [isDesktop, closeMenu]);

  return (
    <Portal>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-60 lg:hidden">
            <m.div
              aria-hidden
              onClick={closeMenu}
              className="absolute inset-0 bg-night/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <m.div
              ref={dialogRef}
              id={MOBILE_MENU_ID}
              role="dialog"
              aria-modal="true"
              aria-label={mobileMenu.label}
              tabIndex={-1}
              data-lenis-prevent
              className="absolute inset-y-0 start-0 flex w-[min(22rem,88vw)] flex-col gap-6 overflow-y-auto bg-canvas p-4 pb-safe outline-none"
              initial={{ x: offset }}
              animate={{ x: 0 }}
              exit={{ x: offset }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            >
              <div className="flex items-center justify-between">
                <Logo locale={locale} size="sm" homeLabel={homeLabel} />
                <button
                  type="button"
                  onClick={closeMenu}
                  aria-label={ui.closeMenu}
                  data-autofocus
                  className="grid size-10 place-items-center rounded-control border border-line-strong text-ink transition-colors hover:bg-sunken"
                >
                  <X className="size-4.5" aria-hidden />
                </button>
              </div>

              <Link
                href={localizePath(locale, routes.warranty)}
                onClick={closeMenu}
                className="group flex flex-col gap-3 rounded-card bg-brand-deep p-4 text-white"
              >
                <span className="flex items-center gap-2 text-sm font-bold">
                  <ShieldCheck className="size-5 text-accent" aria-hidden />
                  {mobileMenu.warrantyTitle}
                </span>
                <span className="text-xs leading-6 text-white/75">{mobileMenu.warrantyBody}</span>
                <span className={buttonVariants({ variant: "accent", size: "sm", block: true })}>
                  {header.warrantyCta}
                </span>
              </Link>

              <nav aria-label={header.navLabel} className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <p className="px-3 pb-1 text-xs font-bold text-muted">{header.productsMenu}</p>
                  {categories.map((category) => {
                    const href = routes.category(category.slug);
                    const isActive = pathname === href;
                    return (
                      <Link
                        key={category.slug}
                        href={localizePath(locale, href)}
                        onClick={closeMenu}
                        aria-current={isActive ? "page" : undefined}
                        className={rowClass(isActive)}
                      >
                        <CategoryIcon name={category.icon} className="size-5" strokeWidth={1.8} />
                        {category.name}
                      </Link>
                    );
                  })}
                  <Link
                    href={localizePath(locale, routes.products)}
                    onClick={closeMenu}
                    className="group flex h-11 items-center justify-between rounded-field px-3 text-sm font-bold text-primary"
                  >
                    {nav.allProducts}
                    <ArrowLeft
                      className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180"
                      aria-hidden
                    />
                  </Link>
                </div>
                <MenuSection title={mobileMenu.support} items={supportNav} />
                <MenuSection title={mobileMenu.explore} items={primaryNav} />
              </nav>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between rounded-field border border-line bg-surface py-1.5 ps-4 pe-1.5">
                  <span className="text-sm font-semibold text-ink">{mobileMenu.appearance}</span>
                  <ThemeToggle />
                </div>
                <div className="flex items-center justify-between rounded-field border border-line bg-surface py-1.5 ps-4 pe-1.5">
                  <span className="text-sm font-semibold text-ink">{ui.languageLabel}</span>
                  <LanguageSwitcher />
                </div>
                <InstallAppButton />
              </div>

              {socials.length > 0 && (
                <ul
                  className="mt-auto flex flex-wrap justify-center gap-2"
                  aria-label={footer.socialLabel}
                >
                  {socials.map((social) => (
                    <li key={social.platform}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="grid size-10 place-items-center rounded-control bg-chip text-ink transition-colors hover:bg-line hover:text-primary"
                      >
                        <SocialIcon platform={social.platform} className="size-4.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
