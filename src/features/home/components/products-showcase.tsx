import { ProductCard } from "@/components/shared/product-card";
import { Carousel } from "@/components/ui/carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { ProductListItem } from "@/types/catalog";

import { homeContent } from "../content";
import { ProductTabs } from "./product-tabs";
import { SectionLink } from "./section-link";

interface ProductsShowcaseProps {
  featured: ProductListItem[];
  latest: ProductListItem[];
  locale: Locale;
}

const GRID_COLUMNS = 4;

export function ProductsShowcase({ featured, latest, locale }: ProductsShowcaseProps) {
  const content = homeContent[locale].products;
  if (featured.length === 0 && latest.length === 0) return null;

  const panel = (products: ProductListItem[]) => {
    const gridCount = Math.max(
      Math.min(products.length, GRID_COLUMNS),
      Math.floor(products.length / GRID_COLUMNS) * GRID_COLUMNS,
    );
    return (
      <Carousel
        label={content.carouselLabel}
        viewportClassName="lg:m-0 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible lg:p-0"
        controlsClassName="lg:hidden"
        slideClassName="basis-[82%] sm:basis-[46%]"
        desktopLimit={gridCount}
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} locale={locale} />
        ))}
      </Carousel>
    );
  };

  return (
    <section aria-labelledby="home-products" className="container-page section-y content-auto">
      <SectionHeading
        id="home-products"
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
        action={
          <SectionLink href={localizePath(locale, routes.products)}>{content.all}</SectionLink>
        }
        className="mb-6"
      />
      <ProductTabs
        label={content.tabsLabel}
        labels={{ featured: content.featured, newest: content.newest }}
        panels={{
          featured: panel(featured.length > 0 ? featured : latest),
          newest: panel(latest),
        }}
      />
    </section>
  );
}
