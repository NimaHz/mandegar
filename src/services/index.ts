import "server-only";

import { cacheTags } from "@/server/lib/cache-tags";

import { cached, scheduled } from "./cache";
import { cachedCatalog } from "./cached/catalog";
import { cachedContent } from "./cached/content";
import type { Api } from "./contracts";
import { supportService } from "./db/support";
import { warrantySchedules, warrantyService } from "./db/warranty";

const policySchedule = cached(
  "warranty.policySchedule",
  [cacheTags.warranty],
  warrantySchedules.policies,
);

export const api: Api = {
  catalog: cachedCatalog,
  content: cachedContent,
  warranty: {
    lookup: warrantyService.lookup,
    policies: scheduled(
      "warranty.policies",
      [cacheTags.warranty],
      warrantyService.policies,
      policySchedule,
    ),
  },
  support: supportService,
};
