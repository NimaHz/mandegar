import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { categoriesAdmin } from "@/services/admin/categories";

import { categoriesQuerySchema, categoryInputSchema, categoryPatchSchema } from "./schema";
import { createCategory, deleteCategory, updateCategory } from "./service";

export const categoryAdminRoutes = new Elysia({ prefix: "/admin/categories" })
  .use(auth)
  .get("/", ({ query }) => categoriesAdmin.list(query), {
    can: "catalog:read",
    query: categoriesQuerySchema,
  })
  .get("/options", () => categoriesAdmin.options(), { can: "catalog:read" })
  .get("/:id", async ({ params }) => orNotFound(await categoriesAdmin.get(params.id)), {
    can: "catalog:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createCategory(body), {
    can: "catalog:write",
    body: categoryInputSchema,
  })
  .patch("/:id", ({ params, body }) => updateCategory(params.id, body), {
    can: "catalog:write",
    params: idParamsSchema,
    body: categoryPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteCategory(params.id), {
    can: "catalog:write",
    params: idParamsSchema,
  });
