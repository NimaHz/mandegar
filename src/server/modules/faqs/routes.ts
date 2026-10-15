import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { faqsAdmin } from "@/services/admin/content";

import { faqInputSchema, faqPatchSchema, faqsQuerySchema } from "./schema";
import { createFaq, deleteFaq, updateFaq } from "./service";

export const faqAdminRoutes = new Elysia({ prefix: "/admin/faqs" })
  .use(auth)
  .get("/", ({ query }) => faqsAdmin.list(query), { can: "content:read", query: faqsQuerySchema })
  .get("/:id", async ({ params }) => orNotFound(await faqsAdmin.get(params.id)), {
    can: "content:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createFaq(body), { can: "content:write", body: faqInputSchema })
  .patch("/:id", ({ params, body }) => updateFaq(params.id, body), {
    can: "content:write",
    params: idParamsSchema,
    body: faqPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteFaq(params.id), {
    can: "content:write",
    params: idParamsSchema,
  });
