import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ProductCard } from "@/components/shared/product-card";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import type { ProductListItem } from "@/types/catalog";

interface ProductGridProps {
  products: ProductListItem[];
  locale: Locale;
  layout?: "sidebar" | "full";
  priorityCount?: number;
  headingLevel?: "h2" | "h3";
}

const layouts = {
  sidebar: "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3",
  full: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
} as const;

export function ProductGrid({
  products,
  locale,
  layout = "sidebar",
  priorityCount = 0,
  headingLevel = "h3",
}: ProductGridProps) {
  return (
    <RevealGroup className={cn("grid gap-4 lg:gap-5", layouts[layout])}>
      {products.map((product, index) => (
        <RevealItem key={product.slug} className="min-w-0">
          <ProductCard
            product={product}
            locale={locale}
            priority={index < priorityCount}
            headingLevel={headingLevel}
          />
        </RevealItem>
      ))}
    </RevealGroup>
  );
}
