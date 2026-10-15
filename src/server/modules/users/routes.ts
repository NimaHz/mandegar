import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { usersAdmin } from "@/services/admin/system";

import { userInputSchema, userPatchSchema, usersQuerySchema } from "./schema";
import { createUser, resetUserPassword, updateUser } from "./service";

export const userAdminRoutes = new Elysia({ prefix: "/admin/users" })
  .use(auth)
  .get("/", ({ query }) => usersAdmin.list(query), { can: "users:manage", query: usersQuerySchema })
  .get("/assignees", () => usersAdmin.assignees(), { can: "tickets:read" })
  .get("/:id", async ({ params }) => orNotFound(await usersAdmin.get(params.id)), {
    can: "users:manage",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createUser(body), { can: "users:manage", body: userInputSchema })
  .patch("/:id", ({ actor, params, body }) => updateUser(actor, params.id, body), {
    can: "users:manage",
    params: idParamsSchema,
    body: userPatchSchema,
  })
  .post("/:id/reset-password", ({ actor, params }) => resetUserPassword(actor, params.id), {
    can: "users:manage",
    params: idParamsSchema,
  });
