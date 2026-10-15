import { createLoader, parseAsString } from "nuqs/server";

export const requestSearchParams = {
  code: parseAsString.withDefault(""),
  product: parseAsString.withDefault(""),
};

export const loadRequestSearchParams = createLoader(requestSearchParams);

export const trackSearchParams = {
  t: parseAsString.withDefault(""),
};

export const loadTrackSearchParams = createLoader(trackSearchParams);
