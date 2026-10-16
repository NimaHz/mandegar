"use client";

import { ArrowLeft, Columns3, LayoutGrid, MapPin } from "lucide-react";
import { m } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId } from "react";

import { CategoryIcon } from "@/components/icons/category-icon";
import { isNavActive, primaryNav, supportNav } from "@/config/navigation";
import { useDictionary, useLocale } from "@/i18n/locale-provider";
import { localizePath, stripLocalePrefix } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { CategorySummary } from "@/types/catalog";

import { layoutContent } from "../content";
import { NavDropdown } from "./nav-dropdown";
import { NavIndicator } from "./nav-indicator";
import { menuItemVariants, navItemClass } from "./nav-styles";

const hideBelowClass = { xl: "max-xl:hidden", "2xl": "max-2xl:hidden" } as const;

type NavCategory = Pick<CategorySummary, "slug" | "name" | "summary" | "icon" | "productCount">;

export function MainNav({ categories }: { categories: NavCategory[] }) {
  const locale = useLocale();
  const { nav } = useDictionary();
  const { header } = layoutContent[locale];
  const pathname = stripLocalePrefix(usePathname());
  const indicatorId = useId();
  const productsActive =
    isNavActive(pathname, { href: routes.products }) ||
    pathname.startsWith(routes.category("")) ||
    isNavActive(pathname, { href: routes.compare });
  const primaryActive = primaryNav.some((item) => isNavActive(pathname, item));
  const supportActive = !primaryActive && supportNav.some((item) => isNavActive(pathname, item));

  return (
    <nav aria-label={header.navLabel} className="flex min-w-0 items-center gap-0.5">
      <NavDropdown
        label={header.productsMenu}
        indicatorId={indicatorId}
        active={productsActive}
        wide
        panelClassName="max-w-[54rem] p-2"
      >
        {(close) => (
          <div className="grid grid-cols-[minmax(0,1fr)_16rem] gap-2">
            <ul className="grid grid-cols-2 gap-0.5 p-1">
              {categories.map((category) => (
                <m.li key={category.slug} variants={menuItemVariants}>
                  <Link
                    href={localizePath(locale, routes.category(category.slug))}
                    onClick={close}
                    className="group flex items-start gap-3 rounded-field p-2.5 transition-colors hover:bg-sunken"
                  >
                    <span className="icon-tile size-10 transition-[scale,background-color,color] duration-300 ease-(--ease-out-expo) group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary">
                      <CategoryIcon name={category.icon} className="size-5" strokeWidth={1.7} />
                    </span>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-bold text-ink">
                        {category.name}
                        <span className="text-caption font-semibold text-muted">
                          {pluralize(locale, category.productCount, header.modelsCount)}
                        </span>
                      </span>
                      <span className="line-clamp-1 text-xs leading-5 text-muted">
                        {category.summary}
                      </span>
                    </span>
                  </Link>
                </m.li>
              ))}
            </ul>
            <m.div
              variants={menuItemVariants}
              className="flex flex-col justify-between gap-5 rounded-field bg-brand-deep p-5 text-white"
            >
              <div className="flex flex-col gap-2">
                <p className="font-display text-lg font-extrabold">{header.productsTitle}</p>
                <p className="text-xs leading-6 text-white/75">{header.productsDescription}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { href: routes.products, label: header.allProducts, icon: LayoutGrid },
                  { href: routes.compare, label: header.compareProducts, icon: Columns3 },
                  { href: routes.serviceCenters, label: header.findCenter, icon: MapPin },
                ].map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={localizePath(locale, href)}
                    onClick={close}
                    className="group flex h-10 items-center gap-2.5 rounded-control px-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="flex-1">{label}</span>
                    <ArrowLeft
                      className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </Link>
                ))}
              </div>
            </m.div>
          </div>
        )}
      </NavDropdown>
      <NavDropdown
        label={header.supportMenu}
        indicatorId={indicatorId}
        active={supportActive}
        panelClassName="w-[30rem] p-2"
      >
        {(close) => (
          <ul className="grid grid-cols-2 gap-0.5">
            {supportNav.map(({ href, label, icon: Icon }) => (
              <m.li key={href} variants={menuItemVariants}>
                <Link
                  href={localizePath(locale, href)}
                  onClick={close}
                  className="group flex items-start gap-3 rounded-field p-2.5 transition-colors hover:bg-sunken"
                >
                  <span className="icon-tile size-9 transition-[scale,background-color,color] duration-300 ease-(--ease-out-expo) group-hover:scale-105 group-hover:bg-primary group-hover:text-on-primary">
                    <Icon className="size-4.5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm font-bold text-ink">{nav[label]}</span>
                    <span className="text-xs leading-5 text-muted">
                      {header.supportHints[label]}
                    </span>
                  </span>
                </Link>
              </m.li>
            ))}
          </ul>
        )}
      </NavDropdown>
      {primaryNav.map((item) => {
        const isActive = isNavActive(pathname, item);
        return (
          <Link
            key={item.href}
            href={localizePath(locale, item.href)}
            aria-current={isActive ? "page" : undefined}
            className={cn(navItemClass(isActive), item.hideBelow && hideBelowClass[item.hideBelow])}
          >
            {isActive && <NavIndicator layoutId={indicatorId} />}
            {nav[item.label]}
          </Link>
        );
      })}
    </nav>
  );
}
