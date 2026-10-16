import { ArrowLeft, Package, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { EnergyBadge } from "@/features/catalog/components/energy-badge";
import { catalogContent } from "@/features/catalog/content";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { formatNumber } from "@/lib/format";
import { blurProps } from "@/lib/image";
import { routes } from "@/lib/routes";
import type { ProductListItem } from "@/types/catalog";

import { CompareToggle } from "./compare-toggle";
import { ModelCodeText } from "./model-code-text";

interface ProductCardProps {
  product: ProductListItem;
  locale: Locale;
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}

const PRODUCT_CARD_SIZES =
  "(min-width: 1280px) 296px, (min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw";

export function ProductCard({
  product,
  locale,
  priority = false,
  headingLevel = "h3",
  className,
}: ProductCardProps) {
  const { card } = catalogContent[locale];
  const Heading = headingLevel;
  const href = localizePath(locale, routes.product(product.slug));

  return (
    <article
      className={cn(
        "group @container relative isolate flex h-full card-interactive flex-col overflow-hidden card shadow-card",
        className,
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-sunken">
        {product.image ? (
          <Image
            src={product.image.src}
            {...blurProps(product.image)}
            alt={product.image.alt}
            fill
            sizes={PRODUCT_CARD_SIZES}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="object-cover transition-transform duration-700 ease-(--ease-out-expo) group-hover:scale-[1.045]"
          />
        ) : (
          <span className="grid size-full place-items-center text-subtle">
            <Package className="size-10" strokeWidth={1.4} aria-hidden />
          </span>
        )}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-night/25 to-transparent"
        />
        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start gap-1.5">
          {product.isNew && (
            <Badge tone="accent" size="sm" className="shadow-card">
              {card.newBadge}
            </Badge>
          )}
          {!product.brand.isOwn && (
            <Badge size="sm" className="bg-raised/90 text-ink shadow-card backdrop-blur">
              <span className="sr-only">{card.partner}: </span>
              {product.brand.name}
            </Badge>
          )}
          {product.energyClass && (
            <EnergyBadge
              value={product.energyClass}
              label={fill(card.energy, { value: product.energyClass })}
              size="sm"
              className="ms-auto shadow-card"
            />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-caption font-bold text-primary">{product.category.name}</p>
        <Heading className="line-clamp-2 text-base leading-snug font-extrabold text-balance text-ink">
          <Link
            href={href}
            className="outline-none after:absolute after:inset-0 after:z-0 after:rounded-card focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset"
          >
            <ModelCodeText text={product.name} />
          </Link>
        </Heading>
        <bdi dir="ltr" className="self-start font-code text-xs font-semibold text-muted">
          {product.modelCode}
        </bdi>
        <p className="line-clamp-2 text-label leading-6 text-body">{product.tagline}</p>

        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-2.5 border-t border-line pt-3.5">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-xs font-semibold text-ink-soft @max-[19rem]:basis-full">
            <ShieldCheck className="size-4 shrink-0 text-success" strokeWidth={1.9} aria-hidden />
            <span className="truncate">
              {fill(card.warranty, { count: formatNumber(locale, product.warrantyMonths) })}
            </span>
          </span>
          <span className="ms-auto flex shrink-0 items-center gap-1">
            <CompareToggle slug={product.slug} name={product.name} />
            <span
              aria-hidden
              className="grid size-7.5 place-items-center rounded-full bg-inverse text-on-inverse transition-[background-color,translate] duration-300 group-hover:-translate-x-0.5 group-hover:bg-primary group-hover:text-on-primary ltr:group-hover:translate-x-0.5"
              title={card.details}
            >
              <ArrowLeft className="size-3.5 ltr:rotate-180" strokeWidth={2.4} />
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
