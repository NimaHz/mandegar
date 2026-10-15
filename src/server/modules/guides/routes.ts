import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { guidesAdmin } from "@/services/admin/guides";

import { guideInputSchema, guidePatchSchema, guidesQuerySchema } from "./schema";
import { createGuide, deleteGuide, updateGuide } from "./service";

export const guideAdminRoutes = new Elysia({ prefix: "/admin/guides" })
  .use(auth)
  .get("/", ({ query }) => guidesAdmin.list(query), {
    can: "content:read",
    query: guidesQuerySchema,
  })
  .get("/options", () => guidesAdmin.options(), { can: "catalog:read" })
  .get("/:id", async ({ params }) => orNotFound(await guidesAdmin.get(params.id)), {
    can: "content:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createGuide(body), { can: "content:write", body: guideInputSchema })
  .patch("/:id", ({ params, body }) => updateGuide(params.id, body), {
    can: "content:write",
    params: idParamsSchema,
    body: guidePatchSchema,
  })
  .delete("/:id", ({ params }) => deleteGuide(params.id), {
    can: "content:write",
    params: idParamsSchema,
  });
