import "server-only";

import type { Api } from "./contracts";
import { catalogService } from "./db/catalog";
import { contentService } from "./db/content";
import { supportService } from "./db/support";
import { warrantyService } from "./db/warranty";

export const api: Api = {
  catalog: catalogService,
  content: contentService,
  warranty: warrantyService,
  support: supportService,
};
