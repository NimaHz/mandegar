"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { springSnappy } from "@/components/motion/easing";
import { LinkPending } from "@/components/providers/navigation-progress";
import { bottomNav, isNavActive } from "@/config/navigation";
import { useLocale } from "@/i18n/locale-provider";
import { localizePath, stripLocalePrefix } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { layoutContent } from "./content";

export function BottomNav() {
  const locale = useLocale();
  const content = layoutContent[locale];
  const pathname = stripLocalePrefix(usePathname());
  const indicatorId = useId();
  const activeHref = bottomNav
    .filter((item) => isNavActive(pathname, item))
    .toSorted((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <nav
      aria-label={content.bottomNavLabel}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/92 pb-safe shadow-bar backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5 px-2 pt-1.5">
        {bottomNav.map((item) => {
          const isActive = item.href === activeHref;
          const isWarranty = item.href === routes.warranty;
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={localizePath(locale, item.href)}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "relative flex h-13 flex-col items-center justify-center gap-1 text-caption transition-[color,scale] duration-200 active:scale-95",
                  isActive ? "font-bold text-primary" : "font-semibold text-muted",
                )}
              >
                {isActive && !isWarranty && (
                  <m.span
                    layoutId={indicatorId}
                    transition={springSnappy}
                    className="absolute top-0 h-0.5 w-7 rounded-full bg-primary"
                  />
                )}
                <span
                  aria-hidden
                  className={cn(
                    "grid place-items-center",
                    isWarranty &&
                      "-mt-6 size-12 rounded-full bg-primary text-on-primary shadow-primary ring-4 ring-canvas",
                  )}
                >
                  <Icon className="size-5.5" strokeWidth={isActive || isWarranty ? 2.2 : 1.8} />
                </span>
                <span className="truncate">{content.bottomNav[item.label]}</span>
                <LinkPending />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
