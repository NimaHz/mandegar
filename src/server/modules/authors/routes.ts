import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { authorsAdmin } from "@/services/admin/content";

import { authorInputSchema, authorPatchSchema, authorsQuerySchema } from "./schema";
import { createAuthor, deleteAuthor, updateAuthor } from "./service";

export const authorAdminRoutes = new Elysia({ prefix: "/admin/authors" })
  .use(auth)
  .get("/", ({ query }) => authorsAdmin.list(query), {
    can: "content:read",
    query: authorsQuerySchema,
  })
  .get("/options", () => authorsAdmin.options(), { can: "content:read" })
  .get("/:id", async ({ params }) => orNotFound(await authorsAdmin.get(params.id)), {
    can: "content:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createAuthor(body), { can: "content:write", body: authorInputSchema })
  .patch("/:id", ({ params, body }) => updateAuthor(params.id, body), {
    can: "content:write",
    params: idParamsSchema,
    body: authorPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteAuthor(params.id), {
    can: "content:write",
    params: idParamsSchema,
  });
