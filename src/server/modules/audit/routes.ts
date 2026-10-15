import { Elysia } from "elysia";

import { auth } from "@/server/plugins/auth";
import { auditAdmin } from "@/services/admin/system";

import { auditQuerySchema } from "./schema";

export const auditAdminRoutes = new Elysia({ prefix: "/admin/audit" })
  .use(auth)
  .get("/", ({ query }) => auditAdmin.list(query), { can: "audit:read", query: auditQuerySchema });
