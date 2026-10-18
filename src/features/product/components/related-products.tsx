import { ProductCard } from "@/components/shared/product-card";
import { Carousel } from "@/components/ui/carousel";
import { SectionHeading } from "@/components/ui/section-heading";
import { SectionLink } from "@/features/home/components/section-link";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { ProductListItem } from "@/types/catalog";

import { productContent } from "../content";

interface RelatedProductsProps {
  products: ProductListItem[];
  locale: Locale;
}

export function RelatedProducts({ products, locale }: RelatedProductsProps) {
  const { related } = productContent[locale];
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="related-products" className="container-page section-y content-auto">
      <SectionHeading
        id="related-products"
        eyebrow={related.eyebrow}
        title={related.title}
        action={
          <SectionLink href={localizePath(locale, routes.products)}>{related.all}</SectionLink>
        }
        className="mb-6"
      />
      <Carousel
        label={related.carouselLabel}
        slideClassName="basis-[82%] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.667rem)] xl:basis-[calc(25%-0.75rem)]"
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} locale={locale} />
        ))}
      </Carousel>
    </section>
  );
}
