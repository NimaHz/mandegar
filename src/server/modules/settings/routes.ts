import { Elysia } from "elysia";

import { auth } from "@/server/plugins/auth";
import { settingsAdmin } from "@/services/admin/system";

import {
  companySettingsSchema,
  contactSettingsSchema,
  seoSettingsSchema,
  statsSettingsSchema,
} from "./schema";
import { saveSetting } from "./service";

export const settingsAdminRoutes = new Elysia({ prefix: "/admin/settings" })
  .use(auth)
  .get("/", () => settingsAdmin.get(), { can: "settings:write" })
  .put("/contact", ({ body }) => saveSetting("contact", body), {
    can: "settings:write",
    body: contactSettingsSchema,
  })
  .put("/seo", ({ body }) => saveSetting("seo", body), {
    can: "settings:write",
    body: seoSettingsSchema,
  })
  .put("/stats", ({ body }) => saveSetting("stats", body), {
    can: "settings:write",
    body: statsSettingsSchema,
  })
  .put("/company", ({ body }) => saveSetting("company", body), {
    can: "settings:write",
    body: companySettingsSchema,
  });
