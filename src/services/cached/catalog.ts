import "server-only";

import { cacheTags } from "@/server/lib/cache-tags";
import type { ProductDetail, ProductsQuery } from "@/types/catalog";

import { cached, isListed, whenListed } from "../cache";
import type { CatalogService } from "../contracts";
import { catalogService, compareSlugs } from "../db/catalog";
import { normalizeSlug } from "../db/mappers";

const { catalog, guides } = cacheTags;
const MAX_CACHED_PAGE = 3;

const categorySlugs = cached("catalog.categorySlugs", [catalog], catalogService.categorySlugs);
const productSlugs = cached("catalog.productSlugs", [catalog], catalogService.productSlugs);
const brandSlugs = cached("catalog.brandSlugs", [catalog], catalogService.brandSlugs);

const category = cached("catalog.category", [catalog], catalogService.category);
const products = cached("catalog.products", [catalog], catalogService.products);
const byCategory = cached("catalog.byCategory", [catalog], catalogService.byCategory);
const categoryInsights = cached(
  "catalog.categoryInsights",
  [catalog],
  catalogService.categoryInsights,
);
const byBrand = cached("catalog.byBrand", [catalog], catalogService.byBrand);
const product = cached("catalog.product", [catalog, guides], catalogService.product);
const related = cached("catalog.related", [catalog], catalogService.related);
const brand = cached("catalog.brand", [catalog], catalogService.brand);

const isCacheable = async (query: ProductsQuery) =>
  !query.q &&
  query.page <= MAX_CACHED_PAGE &&
  (!query.category || (await isListed(categorySlugs, query.category))) &&
  (!query.brand || (await isListed(brandSlugs, query.brand)));

const listedProduct = whenListed(productSlugs, product, null);

export const cachedCatalog: CatalogService = {
  categories: cached("catalog.categories", [catalog], catalogService.categories),
  category: whenListed(categorySlugs, category, null),
  categorySlugs,
  products: async (locale, query) => {
    const listed = {
      ...query,
      category: query.category && normalizeSlug(query.category),
      brand: query.brand && normalizeSlug(query.brand),
    };
    return (await isCacheable(listed))
      ? products(locale, listed)
      : catalogService.products(locale, query);
  },
  facets: cached("catalog.facets", [catalog], catalogService.facets),
  featured: cached("catalog.featured", [catalog], catalogService.featured),
  latest: cached("catalog.latest", [catalog], catalogService.latest),
  byCategory: whenListed(categorySlugs, byCategory, []),
  categoryInsights: whenListed(categorySlugs, categoryInsights, []),
  models: cached("catalog.models", [catalog], catalogService.models),
  bySlugs: catalogService.bySlugs,
  byBrand: whenListed(brandSlugs, byBrand, []),
  product: listedProduct,
  related: whenListed(productSlugs, related, []),
  compare: async (locale, slugs) => {
    const details = await Promise.all(
      compareSlugs(slugs).map((slug) => listedProduct(locale, slug)),
    );
    return details.filter((detail): detail is ProductDetail => detail !== null);
  },
  productSlugs,
  brands: cached("catalog.brands", [catalog], catalogService.brands),
  brand: whenListed(brandSlugs, brand, null),
  brandSlugs,
  search: catalogService.search,
};
