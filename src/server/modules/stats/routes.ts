import { Elysia } from "elysia";

import { auth } from "@/server/plugins/auth";
import { statsAdmin } from "@/services/admin/system";

export const statsAdminRoutes = new Elysia({ prefix: "/admin/stats" })
  .use(auth)
  .get("/", ({ actor }) => statsAdmin.get(actor.permissions), { can: "dashboard:read" });
