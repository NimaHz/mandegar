import "server-only";

import { Elysia } from "elysia";

import { altchaRoutes } from "./modules/altcha/routes";
import { auditAdminRoutes } from "./modules/audit/routes";
import { authRoutes } from "./modules/auth/routes";
import { authorAdminRoutes } from "./modules/authors/routes";
import { brandAdminRoutes } from "./modules/brands/routes";
import { categoryAdminRoutes } from "./modules/categories/routes";
import { contactRoutes, messageAdminRoutes } from "./modules/contact/routes";
import { faqAdminRoutes } from "./modules/faqs/routes";
import { guideAdminRoutes } from "./modules/guides/routes";
import { healthRoutes } from "./modules/health/routes";
import { mediaAdminRoutes } from "./modules/media/routes";
import { postAdminRoutes } from "./modules/posts/routes";
import { productAdminRoutes } from "./modules/products/routes";
import { searchRoutes } from "./modules/search/routes";
import { serviceCenterAdminRoutes } from "./modules/service-centers/routes";
import { settingsAdminRoutes } from "./modules/settings/routes";
import { slideAdminRoutes } from "./modules/slides/routes";
import { statsAdminRoutes } from "./modules/stats/routes";
import { ticketAdminRoutes, ticketRoutes } from "./modules/tickets/routes";
import { userAdminRoutes } from "./modules/users/routes";
import {
  warrantyCodeAdminRoutes,
  warrantyPolicyAdminRoutes,
  warrantyRoutes,
} from "./modules/warranty/routes";
import { errors } from "./plugins/errors";
import { security } from "./plugins/security";

export const app = new Elysia({ prefix: "/api", aot: false })
  .use(errors)
  .use(security)
  .use(healthRoutes)
  .use(searchRoutes)
  .use(warrantyRoutes)
  .use(ticketRoutes)
  .use(contactRoutes)
  .use(altchaRoutes)
  .use(authRoutes)
  .use(statsAdminRoutes)
  .use(productAdminRoutes)
  .use(categoryAdminRoutes)
  .use(brandAdminRoutes)
  .use(mediaAdminRoutes)
  .use(guideAdminRoutes)
  .use(warrantyPolicyAdminRoutes)
  .use(warrantyCodeAdminRoutes)
  .use(slideAdminRoutes)
  .use(ticketAdminRoutes)
  .use(messageAdminRoutes)
  .use(serviceCenterAdminRoutes)
  .use(faqAdminRoutes)
  .use(postAdminRoutes)
  .use(authorAdminRoutes)
  .use(settingsAdminRoutes)
  .use(userAdminRoutes)
  .use(auditAdminRoutes);

export type App = typeof app;
