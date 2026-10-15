import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { brandsAdmin } from "@/services/admin/brands";

import { brandInputSchema, brandPatchSchema, brandsQuerySchema } from "./schema";
import { createBrand, deleteBrand, updateBrand } from "./service";

export const brandAdminRoutes = new Elysia({ prefix: "/admin/brands" })
  .use(auth)
  .get("/", ({ query }) => brandsAdmin.list(query), {
    can: "catalog:read",
    query: brandsQuerySchema,
  })
  .get("/options", () => brandsAdmin.options(), { can: "catalog:read" })
  .get("/:id", async ({ params }) => orNotFound(await brandsAdmin.get(params.id)), {
    can: "catalog:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createBrand(body), { can: "catalog:write", body: brandInputSchema })
  .patch("/:id", ({ params, body }) => updateBrand(params.id, body), {
    can: "catalog:write",
    params: idParamsSchema,
    body: brandPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteBrand(params.id), {
    can: "catalog:write",
    params: idParamsSchema,
  });
