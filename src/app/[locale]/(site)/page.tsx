import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CompareTray } from "@/components/shared/compare-tray";
import { toTrayItems } from "@/features/compare/tray-items";
import { BrandPromise } from "@/features/home/components/brand-promise";
import { CategoriesBento } from "@/features/home/components/categories-bento";
import { HeroCarousel } from "@/features/home/components/hero-carousel";
import { HomeFaq } from "@/features/home/components/home-faq";
import { InstallationGuides } from "@/features/home/components/installation-guides";
import { LatestPosts } from "@/features/home/components/latest-posts";
import { PartnerBrands } from "@/features/home/components/partner-brands";
import { ProductsShowcase } from "@/features/home/components/products-showcase";
import { ServiceJourney } from "@/features/home/components/service-journey";
import { WarrantyStrip } from "@/features/home/components/warranty-strip";
import { WhyMandegar } from "@/features/home/components/why-mandegar";
import { homeContent } from "@/features/home/content";
import { localizeHref } from "@/features/home/links";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { homeGraph } from "@/lib/seo/graphs";
import { pageMetadata } from "@/lib/seo/metadata";
import { api } from "@/services";

export const revalidate = 3600;

const PRODUCT_LIMIT = 8;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const content = homeContent[locale];
  const [slide] = await api.content.heroSlides(locale);
  return {
    ...pageMetadata({
      locale,
      path: routes.home,
      title: content.metaTitle,
      description: content.metaDescription,
      image: slide
        ? { url: slide.image.src, width: slide.image.width, height: slide.image.height }
        : null,
    }),
    title: { absolute: content.metaTitle },
  };
}

export default async function HomePage() {
  const locale = await getLocale();
  const [dictionary, slides, categories, featured, latest, brands, guides, posts, faqs, settings] =
    await Promise.all([
      getDictionary(locale),
      api.content.heroSlides(locale),
      api.catalog.categories(locale),
      api.catalog.featured(locale, PRODUCT_LIMIT),
      api.catalog.latest(locale, PRODUCT_LIMIT),
      api.catalog.brands(locale),
      api.content.guides(locale),
      api.content.latestPosts(locale, 3),
      api.content.faqs(locale, "general"),
      api.content.settings(locale),
    ]);
  const showcaseImage =
    featured
      .flatMap((product) => (product.image ? [product.image] : []))
      .toSorted((left, right) => right.height / right.width - left.height / left.width)[0] ?? null;

  const content = homeContent[locale];
  const graph = await homeGraph(
    locale,
    { name: content.metaTitle, description: content.metaDescription },
    featured,
  );

  return (
    <>
      <JsonLd data={graph} />
      <h1 className="sr-only">
        {dictionary.site.name}، {dictionary.site.slogan}
      </h1>
      <HeroCarousel
        slides={slides.map((slide) => ({
          ...slide,
          ctaHref: slide.ctaHref ? localizeHref(locale, slide.ctaHref) : null,
        }))}
        secondaryHref={localizePath(locale, routes.products)}
      />
      <WarrantyStrip locale={locale} overlap={slides.length > 0} />
      <CategoriesBento categories={categories} locale={locale} />
      <ProductsShowcase featured={featured} latest={latest} locale={locale} />
      <BrandPromise stats={settings.stats} locale={locale} />
      <WhyMandegar
        image={showcaseImage}
        warrantyMonths={settings.stats.warrantyMonths}
        locale={locale}
      />
      <PartnerBrands brands={brands} locale={locale} />
      <InstallationGuides guides={guides} locale={locale} />
      <ServiceJourney locale={locale} />
      <LatestPosts posts={posts} locale={locale} />
      <HomeFaq faqs={faqs} locale={locale} />
      <CompareTray products={toTrayItems([...featured, ...latest])} />
    </>
  );
}
