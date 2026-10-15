import {
  createLoader,
  createSerializer,
  type inferParserType,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

import { energyClasses, productSorts } from "@/types/catalog";

export const catalogSearchParams = {
  q: parseAsString.withDefault(""),
  category: parseAsString,
  brand: parseAsString,
  energy: parseAsStringLiteral(energyClasses),
  sort: parseAsStringLiteral(productSorts).withDefault("featured"),
  page: parseAsInteger.withDefault(1),
};

export type CatalogFilters = inferParserType<typeof catalogSearchParams>;

export const loadCatalogSearchParams = createLoader(catalogSearchParams);

export const serializeCatalogSearchParams = createSerializer(catalogSearchParams);
