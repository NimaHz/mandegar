import "server-only";

import type { Locale } from "@/i18n/config";
import { api } from "@/services";
import type { WarrantyLookup } from "@/types/warranty";

export const lookupWarranty = (
  locale: Locale,
  code: string,
  clientKey: string,
): Promise<WarrantyLookup> => api.warranty.lookup(locale, code, clientKey);
