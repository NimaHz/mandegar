import "server-only";

import { brandsAdmin } from "./brands";
import { categoriesAdmin } from "./categories";
import { authorsAdmin, faqsAdmin, postsAdmin, serviceCentersAdmin, slidesAdmin } from "./content";
import { guidesAdmin } from "./guides";
import { mediaAdmin } from "./media";
import { messagesAdmin } from "./messages";
import { productsAdmin } from "./products";
import { auditAdmin, settingsAdmin, statsAdmin, usersAdmin } from "./system";
import { ticketsAdmin } from "./tickets";
import { warrantyCodesAdmin, warrantyPoliciesAdmin } from "./warranty";

export const adminApi = {
  stats: statsAdmin,
  products: productsAdmin,
  categories: categoriesAdmin,
  brands: brandsAdmin,
  media: mediaAdmin,
  guides: guidesAdmin,
  warrantyPolicies: warrantyPoliciesAdmin,
  warrantyCodes: warrantyCodesAdmin,
  slides: slidesAdmin,
  tickets: ticketsAdmin,
  messages: messagesAdmin,
  serviceCenters: serviceCentersAdmin,
  faqs: faqsAdmin,
  posts: postsAdmin,
  authors: authorsAdmin,
  settings: settingsAdmin,
  users: usersAdmin,
  audit: auditAdmin,
};
