import { createLoader, parseAsString } from "nuqs/server";

export const warrantySearchParams = {
  code: parseAsString.withDefault(""),
};

export const loadWarrantySearchParams = createLoader(warrantySearchParams);
