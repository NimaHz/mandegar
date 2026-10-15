import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { serviceCentersAdmin } from "@/services/admin/content";

import {
  serviceCenterInputSchema,
  serviceCenterPatchSchema,
  serviceCentersQuerySchema,
} from "./schema";
import { createServiceCenter, deleteServiceCenter, updateServiceCenter } from "./service";

export const serviceCenterAdminRoutes = new Elysia({ prefix: "/admin/service-centers" })
  .use(auth)
  .get("/", ({ query }) => serviceCentersAdmin.list(query), {
    can: "content:read",
    query: serviceCentersQuerySchema,
  })
  .get("/:id", async ({ params }) => orNotFound(await serviceCentersAdmin.get(params.id)), {
    can: "content:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createServiceCenter(body), {
    can: "content:write",
    body: serviceCenterInputSchema,
  })
  .patch("/:id", ({ params, body }) => updateServiceCenter(params.id, body), {
    can: "content:write",
    params: idParamsSchema,
    body: serviceCenterPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteServiceCenter(params.id), {
    can: "content:write",
    params: idParamsSchema,
  });
