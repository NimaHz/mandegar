import {
  createLoader,
  createSerializer,
  type inferParserType,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const centerKindFilters = ["dealer", "service"] as const;

export const serviceCentersSearchParams = {
  province: parseAsString,
  kind: parseAsStringLiteral(centerKindFilters),
};

export type ServiceCentersFilters = inferParserType<typeof serviceCentersSearchParams>;

export const loadServiceCentersSearchParams = createLoader(serviceCentersSearchParams);

export const serializeServiceCentersSearchParams = createSerializer(serviceCentersSearchParams);
