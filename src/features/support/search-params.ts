import { parseAsString } from "nuqs/server";

export const requestSearchParams = {
  code: parseAsString.withDefault(""),
  product: parseAsString.withDefault(""),
};

export const trackSearchParams = {
  t: parseAsString.withDefault(""),
};
