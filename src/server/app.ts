import "server-only";

import { Elysia } from "elysia";

import { altchaRoutes } from "./modules/altcha/routes";
import { contactRoutes } from "./modules/contact/routes";
import { healthRoutes } from "./modules/health/routes";
import { searchRoutes } from "./modules/search/routes";
import { ticketRoutes } from "./modules/tickets/routes";
import { warrantyRoutes } from "./modules/warranty/routes";
import { errors } from "./plugins/errors";
import { security } from "./plugins/security";

export const app = new Elysia({ prefix: "/api" })
  .use(errors)
  .use(security)
  .use(healthRoutes)
  .use(searchRoutes)
  .use(warrantyRoutes)
  .use(ticketRoutes)
  .use(contactRoutes)
  .use(altchaRoutes);

export type App = typeof app;
