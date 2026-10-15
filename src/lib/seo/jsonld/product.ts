import { type Locale, localeMeta } from "@/i18n/config";
import { routes } from "@/lib/routes";
import type { ProductDetail, ProductListItem, SpecItem } from "@/types/catalog";

import { absoluteUrl, localeUrl } from "../urls";
import { brandId, guideArticleId, guideVideoId, productId, ref, siteIds, webPageId } from "./ids";
import type { JsonLdNode } from "./types";

export interface ProductGuideRef {
  slug: string;
  title: string;
  hasVideo: boolean;
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

const guideRefs = (locale: Locale, guide: ProductGuideRef): JsonLdNode[] => {
  const url = localeUrl(locale, routes.guide(guide.slug));
  const article: JsonLdNode = {
    "@type": "TechArticle",
    "@id": guideArticleId(locale, guide.slug),
    headline: guide.title,
    url,
  };
  if (!guide.hasVideo) return [article];
  return [
    article,
    { "@type": "VideoObject", "@id": guideVideoId(locale, guide.slug), name: guide.title, url },
  ];
};

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
    image: images.map((image) => absoluteUrl(image.src)),
    releaseDate: product.releaseYear ? String(product.releaseYear) : null,
    inLanguage: localeMeta[locale].hreflang,
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
    subjectOf: guide ? guideRefs(locale, guide) : null,
  };
};
