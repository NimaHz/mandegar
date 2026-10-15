import "server-only";

import { cacheTags } from "@/server/lib/cache-tags";

import { cached } from "./cache";
import { cachedCatalog } from "./cached/catalog";
import { cachedContent } from "./cached/content";
import type { Api } from "./contracts";
import { supportService } from "./db/support";
import { warrantyService } from "./db/warranty";

export const api: Api = {
  catalog: cachedCatalog,
  content: cachedContent,
  warranty: {
    lookup: warrantyService.lookup,
    policies: cached("warranty.policies", [cacheTags.warranty], warrantyService.policies),
  },
  support: supportService,
};
