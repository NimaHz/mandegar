import type { Locale } from "@/i18n/config";
import { routes } from "@/lib/routes";
import type { ProductDetail, ProductListItem, SpecItem } from "@/types/catalog";

import { localeUrl } from "../urls";
import { brandId, guideArticleId, productId, ref, siteIds, webPageId } from "./ids";
import { imageObject } from "./image";
import type { JsonLdNode } from "./types";

export interface ProductGuideRef {
  slug: string;
  title: string;
}

export interface WarrantyLabels {
  name: string;
  unit: string;
}

interface ProductNodeInput {
  locale: Locale;
  product: ProductDetail;
  related: Pick<ProductListItem, "slug" | "name" | "modelCode">[];
  guide: ProductGuideRef | null;
  warranty: WarrantyLabels;
}

const specProperty = (item: SpecItem): JsonLdNode => ({
  "@type": "PropertyValue",
  propertyID: item.key,
  name: item.label,
  value: item.numeric ?? item.value,
  unitCode: item.unitCode,
  unitText: item.unit,
});

const productStub = (
  locale: Locale,
  item: Pick<ProductListItem, "slug" | "name" | "modelCode">,
): JsonLdNode => ({
  "@type": "Product",
  "@id": productId(locale, item.slug),
  name: item.name,
  model: item.modelCode,
  url: localeUrl(locale, routes.product(item.slug)),
});

const guideStub = (locale: Locale, guide: ProductGuideRef): JsonLdNode => ({
  "@type": "TechArticle",
  "@id": guideArticleId(locale, guide.slug),
  headline: guide.title,
  url: localeUrl(locale, routes.guide(guide.slug)),
});

export const productNode = ({
  locale,
  product,
  related,
  guide,
  warranty,
}: ProductNodeInput): JsonLdNode => {
  const url = localeUrl(locale, routes.product(product.slug));
  const images =
    product.gallery.length > 0 ? product.gallery : product.image ? [product.image] : [];
  return {
    "@type": "Product",
    "@id": productId(locale, product.slug),
    url,
    name: product.name,
    alternateName: product.modelCode,
    model: product.modelCode,
    sku: product.modelCode,
    mpn: product.modelCode,
    description: product.summary || product.tagline,
    slogan: product.tagline,
    category: product.category.name,
    brand: product.brand.isOwn
      ? ref(siteIds.brand)
      : {
          "@type": "Brand",
          "@id": brandId(locale, product.brand),
          name: product.brand.name,
          url: localeUrl(locale, routes.brand(product.brand.slug)),
        },
    manufacturer: product.brand.isOwn ? ref(siteIds.organization) : null,
    image: images.map(imageObject),
    releaseDate: product.releaseYear ? String(product.releaseYear) : null,
    mainEntityOfPage: ref(webPageId(url)),
    additionalProperty: [
      ...product.specs.flatMap((group) => group.items.map(specProperty)),
      {
        "@type": "PropertyValue",
        propertyID: "warranty",
        name: warranty.name,
        value: product.warrantyMonths,
        unitCode: "MON",
        unitText: warranty.unit,
      },
    ],
    isRelatedTo: related.map((item) => productStub(locale, item)),
    subjectOf: guide ? guideStub(locale, guide) : null,
  };
};
