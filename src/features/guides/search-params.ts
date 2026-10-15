import { createLoader, createSerializer, parseAsString } from "nuqs/server";

export const guidesSearchParams = {
  category: parseAsString,
};

export const loadGuidesSearchParams = createLoader(guidesSearchParams);

export const serializeGuidesSearchParams = createSerializer(guidesSearchParams);
