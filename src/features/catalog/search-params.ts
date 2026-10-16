import {
  createLoader,
  createParser,
  createSerializer,
  type inferParserType,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

import { energyClasses, productSorts } from "@/types/catalog";

const parseAsText = createParser({
  parse: (value) => value.replaceAll("\u0000", ""),
  serialize: (value: string) => value,
});

export const catalogSearchParams = {
  q: parseAsText.withDefault(""),
  category: parseAsText,
  brand: parseAsText,
  energy: parseAsStringLiteral(energyClasses),
  sort: parseAsStringLiteral(productSorts).withDefault("featured"),
  page: parseAsInteger.withDefault(1),
};

export type CatalogFilters = inferParserType<typeof catalogSearchParams>;

export const loadCatalogSearchParams = createLoader(catalogSearchParams);

export const serializeCatalogSearchParams = createSerializer(catalogSearchParams);
