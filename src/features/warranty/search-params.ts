import { parseAsString } from "nuqs/server";

export const warrantySearchParams = {
  code: parseAsString.withDefault(""),
};
