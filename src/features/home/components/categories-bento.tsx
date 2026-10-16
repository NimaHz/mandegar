import { ArrowUpLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { CategoryIcon } from "@/components/icons/category-icon";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { pluralize } from "@/i18n/plural";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";
import type { CategorySummary } from "@/types/catalog";

import { homeContent } from "../content";
import { SectionLink } from "./section-link";

interface CategoriesBentoProps {
  categories: CategorySummary[];
  locale: Locale;
}

const tiles = [
  { className: "col-span-2 aspect-16/11 lg:col-span-2 lg:row-span-2 lg:aspect-auto", size: "lg" },
  { className: "aspect-4/5 lg:col-span-2 lg:aspect-auto", size: "md" },
  { className: "aspect-4/5 lg:col-span-2 lg:aspect-auto", size: "md" },
  { className: "aspect-4/5 lg:aspect-auto", size: "sm" },
  { className: "aspect-4/5 lg:aspect-auto", size: "sm" },
  { className: "col-span-2 aspect-16/9 lg:col-span-2 lg:aspect-auto", size: "md" },
] as const;

const tileSizes = {
  lg: "(min-width: 1024px) 420px, 100vw",
  md: "(min-width: 1024px) 420px, 50vw",
  sm: "(min-width: 1024px) 210px, 50vw",
} as const;

export function CategoriesBento({ categories, locale }: CategoriesBentoProps) {
  const content = homeContent[locale].categories;
  const items = categories
    .filter((category) => category.parentSlug === null)
    .slice(0, tiles.length);
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="home-categories" className="container-page section-y">
      <SectionHeading
        id="home-categories"
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        action={
          <SectionLink href={localizePath(locale, routes.products)}>{content.all}</SectionLink>
        }
        className="mb-8 lg:mb-10"
      />
      <RevealGroup className="grid grid-cols-2 gap-3 sm:gap-4 lg:auto-rows-[14.5rem] lg:grid-cols-6">
        {items.map((category, index) => {
          const tile = tiles[index] ?? tiles[3];
          const large = tile.size === "lg";
          const small = tile.size === "sm";
          return (
            <RevealItem key={category.slug} className={cn("min-w-0", tile.className)}>
              <Link
                href={localizePath(locale, routes.category(category.slug))}
                className="group relative isolate flex size-full flex-col justify-between overflow-hidden rounded-panel bg-brand-deep p-4 text-white shadow-card transition-shadow duration-500 hover:shadow-lift sm:p-5 lg:p-6"
              >
                {category.image && (
                  <Image
                    src={category.image.src}
                    alt=""
                    fill
                    sizes={tileSizes[tile.size]}
                    className="-z-20 object-cover transition-transform duration-[1200ms] ease-(--ease-out-expo) group-hover:scale-[1.06]"
                  />
                )}
                <span
                  aria-hidden
                  className="absolute inset-0 -z-10 bg-linear-to-t from-night/90 via-night/35 to-night/5 transition-opacity duration-500 group-hover:opacity-90"
                />
                <span className="flex items-start justify-between gap-3">
                  <span
                    aria-hidden
                    className={cn(
                      "grid place-items-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur-md",
                      large ? "size-13" : "size-10",
                    )}
                  >
                    <CategoryIcon
                      name={category.icon}
                      className={large ? "size-6" : "size-5"}
                      strokeWidth={1.7}
                    />
                  </span>
                  <span
                    aria-hidden
                    className="grid size-10 place-items-center rounded-full bg-white text-brand-deep opacity-0 transition-[opacity,translate] duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:hidden lg:translate-y-1"
                  >
                    <ArrowUpLeft className="size-4.5 ltr:-scale-x-100" />
                  </span>
                </span>
                <span className="flex flex-col gap-1.5">
                  <span
                    className={cn(
                      "font-display leading-snug font-black text-balance",
                      large ? "text-2xl sm:text-3xl lg:text-[2.25rem]" : "text-lg sm:text-xl",
                    )}
                  >
                    {category.name}
                  </span>
                  {!small && (
                    <span
                      className={cn(
                        "line-clamp-2 max-w-md text-sm leading-6 text-white/80",
                        !large && "max-lg:hidden",
                      )}
                    >
                      {category.summary}
                    </span>
                  )}
                  <span className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full bg-white/12 px-2.5 py-1 text-xs font-bold ring-1 ring-white/20 backdrop-blur-sm">
                    <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                    {pluralize(locale, category.productCount, content.models)}
                  </span>
                </span>
              </Link>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </section>
  );
}
