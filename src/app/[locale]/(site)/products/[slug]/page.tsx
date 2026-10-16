import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CompareTray } from "@/components/shared/compare-tray";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FaqList } from "@/features/catalog/components/faq-list";
import { toTrayItems } from "@/features/compare/tray-items";
import { ProductDownloads } from "@/features/product/components/product-downloads";
import { ProductFeatures } from "@/features/product/components/product-features";
import { ProductHeader } from "@/features/product/components/product-header";
import { ProductInstallation } from "@/features/product/components/product-installation";
import { ProductOverview } from "@/features/product/components/product-overview";
import { ProductSection } from "@/features/product/components/product-section";
import { ProductWarranty } from "@/features/product/components/product-warranty";
import { RecentlyViewed } from "@/features/product/components/recently-viewed";
import { RelatedProducts } from "@/features/product/components/related-products";
import { SectionNav } from "@/features/product/components/section-nav";
import { SpecTables } from "@/features/product/components/spec-tables";
import { productContent, type ProductSectionId } from "@/features/product/content";
import { policyFor } from "@/features/product/policy";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocale } from "@/i18n/get-locale";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { productGraph } from "@/lib/seo/graphs";
import { absoluteUrl, pageMetadata } from "@/lib/seo/metadata";
import { ogEntityTarget } from "@/lib/seo/og/cards";
import { api } from "@/services";

export const revalidate = 3600;

const RELATED_LIMIT = 8;
const TITLE_BUDGET = 48;

export async function generateStaticParams() {
  const slugs = await api.catalog.productSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/products/[slug]">): Promise<Metadata> {
  const locale = await getLocale();
  const { slug } = await params;
  const product = await api.catalog.product(locale, slug);
  if (!product) notFound();
  const image = product.image;
  const combined = `${product.name} – ${product.tagline}`;
  return pageMetadata({
    locale,
    path: routes.product(product.slug),
    title: product.seo.title ?? (combined.length <= TITLE_BUDGET ? combined : product.name),
    description: product.seo.description ?? product.summary,
    image: image
      ? { url: image.src, width: image.width, height: image.height, alt: image.alt }
      : null,
    og: await ogEntityTarget(locale, "product", product.slug),
  });
}

export default async function ProductPage({ params }: PageProps<"/[locale]/products/[slug]">) {
  const locale = await getLocale();
  const { slug } = await params;
  const product = await api.catalog.product(locale, slug);
  if (!product) notFound();

  const [dictionary, guide, policies, related] = await Promise.all([
    getDictionary(locale),
    product.guideSlug ? api.content.guide(locale, product.guideSlug) : Promise.resolve(null),
    api.warranty.policies(locale),
    api.catalog.related(locale, product.slug, RELATED_LIMIT),
  ]);
  const content = productContent[locale];
  const path = routes.product(product.slug);
  const breadcrumbs = [
    { label: dictionary.nav.home, href: localizePath(locale, routes.home) },
    { label: dictionary.nav.products, href: localizePath(locale, routes.products) },
    {
      label: product.category.name,
      href: localizePath(locale, routes.category(product.category.slug)),
    },
    { label: product.modelCode },
  ];
  const graph = await productGraph(locale, {
    product,
    related,
    guide,
    breadcrumbs,
    faqTitle: content.faq.title,
  });
  const sectionIds: ProductSectionId[] = [
    "overview",
    "specs",
    ...(product.features.length > 0 ? (["features"] as const) : []),
    "installation",
    ...(product.downloads.length > 0 ? (["downloads"] as const) : []),
    "warranty",
    ...(product.faqs.length > 0 ? (["faq"] as const) : []),
  ];

  return (
    <>
      <JsonLd data={graph} />
      <ProductHeader
        product={product}
        locale={locale}
        updatedLabel={dictionary.common.updatedAt}
        url={absoluteUrl(localizePath(locale, path))}
        breadcrumbs={<Breadcrumbs label={dictionary.ui.breadcrumbsLabel} items={breadcrumbs} />}
      />

      <SectionNav
        label={content.sectionNav}
        items={sectionIds.map((id) => ({ id, label: content.sections[id] }))}
      />

      <div className="container-page">
        <ProductSection
          id="overview"
          eyebrow={content.overview.eyebrow}
          title={content.overview.title}
        >
          <ProductOverview summary={product.summary} description={product.description} />
        </ProductSection>

        <ProductSection
          id="specs"
          eyebrow={content.specs.eyebrow}
          title={content.specs.title}
          description={content.specs.description}
        >
          <SpecTables groups={product.specs} locale={locale} labelHeader={content.specs.label} />
        </ProductSection>

        {product.features.length > 0 && (
          <ProductSection
            id="features"
            eyebrow={content.features.eyebrow}
            title={content.features.title}
          >
            <ProductFeatures features={product.features} locale={locale} />
          </ProductSection>
        )}

        <ProductSection
          id="installation"
          eyebrow={content.installation.eyebrow}
          title={content.installation.title}
          description={content.installation.description}
        >
          <ProductInstallation guide={guide} productSlug={product.slug} locale={locale} />
        </ProductSection>

        {product.downloads.length > 0 && (
          <ProductSection
            id="downloads"
            eyebrow={content.downloads.eyebrow}
            title={content.downloads.title}
          >
            <ProductDownloads downloads={product.downloads} locale={locale} />
          </ProductSection>
        )}

        <ProductSection
          id="warranty"
          eyebrow={content.warranty.eyebrow}
          title={content.warranty.title}
        >
          <ProductWarranty
            months={product.warrantyMonths}
            policy={policyFor(policies, product.warrantyMonths)}
            productSlug={product.slug}
            locale={locale}
          />
        </ProductSection>

        {product.faqs.length > 0 && (
          <ProductSection
            id="faq"
            eyebrow={content.faq.eyebrow}
            title={content.faq.title}
            action={
              <Link
                href={localizePath(locale, routes.faq)}
                className="text-sm font-bold text-primary hover:underline"
              >
                {content.faq.all}
              </Link>
            }
          >
            <FaqList items={product.faqs} />
          </ProductSection>
        )}
      </div>

      <div className="border-t border-line bg-surface">
        <RelatedProducts products={related} locale={locale} />
        <RecentlyViewed current={product.slug} />
      </div>
      <CompareTray products={toTrayItems([product, ...related])} />
    </>
  );
}
