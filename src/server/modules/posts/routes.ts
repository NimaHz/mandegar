import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { postsAdmin } from "@/services/admin/content";

import { postInputSchema, postPatchSchema, postsQuerySchema } from "./schema";
import { createPost, deletePost, updatePost } from "./service";

export const postAdminRoutes = new Elysia({ prefix: "/admin/posts" })
  .use(auth)
  .get("/", ({ query }) => postsAdmin.list(query), { can: "content:read", query: postsQuerySchema })
  .get("/:id", async ({ params }) => orNotFound(await postsAdmin.get(params.id)), {
    can: "content:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createPost(body), { can: "content:write", body: postInputSchema })
  .patch("/:id", ({ params, body }) => updatePost(params.id, body), {
    can: "content:write",
    params: idParamsSchema,
    body: postPatchSchema,
  })
  .delete("/:id", ({ params }) => deletePost(params.id), {
    can: "content:write",
    params: idParamsSchema,
  });
