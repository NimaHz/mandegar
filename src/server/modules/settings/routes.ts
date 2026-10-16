import { Elysia } from "elysia";

import { expectedUpdatedAtSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { settingsAdmin } from "@/services/admin/system";

import {
  companySettingsSchema,
  contactSettingsSchema,
  featureSettingsSchema,
  seoSettingsSchema,
  statsSettingsSchema,
} from "./schema";
import { readSetting, saveSetting } from "./service";

const versioned = { expectedUpdatedAt: expectedUpdatedAtSchema };

export const settingsAdminRoutes = new Elysia({ prefix: "/admin/settings" })
  .use(auth)
  .get("/", () => settingsAdmin.get(), { can: "settings:write" })
  .get("/contact", () => readSetting("contact"), { can: "settings:write" })
  .put(
    "/contact",
    ({ body: { expectedUpdatedAt, ...value } }) => saveSetting("contact", value, expectedUpdatedAt),
    { can: "settings:write", body: contactSettingsSchema.extend(versioned) },
  )
  .get("/seo", () => readSetting("seo"), { can: "settings:write" })
  .put(
    "/seo",
    ({ body: { expectedUpdatedAt, ...value } }) => saveSetting("seo", value, expectedUpdatedAt),
    { can: "settings:write", body: seoSettingsSchema.extend(versioned) },
  )
  .get("/stats", () => readSetting("stats"), { can: "settings:write" })
  .put(
    "/stats",
    ({ body: { expectedUpdatedAt, ...value } }) => saveSetting("stats", value, expectedUpdatedAt),
    { can: "settings:write", body: statsSettingsSchema.extend(versioned) },
  )
  .get("/company", () => readSetting("company"), { can: "settings:write" })
  .put(
    "/company",
    ({ body: { expectedUpdatedAt, ...value } }) => saveSetting("company", value, expectedUpdatedAt),
    { can: "settings:write", body: companySettingsSchema.extend(versioned) },
  )
  .get("/features", () => readSetting("features"), { can: "settings:write" })
  .put(
    "/features",
    ({ body: { expectedUpdatedAt, ...value } }) =>
      saveSetting("features", value, expectedUpdatedAt),
    { can: "settings:write", body: featureSettingsSchema.extend(versioned) },
  );
