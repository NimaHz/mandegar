import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { slidesAdmin } from "@/services/admin/content";

import { slideInputSchema, slidePatchSchema, slidesQuerySchema } from "./schema";
import { createSlide, deleteSlide, updateSlide } from "./service";

export const slideAdminRoutes = new Elysia({ prefix: "/admin/slides" })
  .use(auth)
  .get("/", ({ query }) => slidesAdmin.list(query), {
    can: "content:read",
    query: slidesQuerySchema,
  })
  .get("/:id", async ({ params }) => orNotFound(await slidesAdmin.get(params.id)), {
    can: "content:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createSlide(body), { can: "content:write", body: slideInputSchema })
  .patch("/:id", ({ params, body }) => updateSlide(params.id, body), {
    can: "content:write",
    params: idParamsSchema,
    body: slidePatchSchema,
  })
  .delete("/:id", ({ params }) => deleteSlide(params.id), {
    can: "content:write",
    params: idParamsSchema,
  });
