import "server-only";

import type { Locale } from "@/i18n/config";
import { api } from "@/services";
import type { SearchHit } from "@/types/catalog";

const MAX_HITS = 8;

export const searchSite = async (locale: Locale, q: string): Promise<{ hits: SearchHit[] }> => ({
  hits: q ? await api.catalog.search(locale, q, MAX_HITS) : [],
});
