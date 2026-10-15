import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { security } from "@/server/plugins/security";
import { messagesAdmin } from "@/services/admin/messages";

import { contactRequestSchema, messagesQuerySchema, messageStatusSchema } from "./schema";
import { deleteMessage, setMessageStatus, submitContact } from "./service";

export const contactRoutes = new Elysia()
  .use(security)
  .post("/contact", ({ body, clientKey }) => submitContact(body, clientKey), {
    body: contactRequestSchema,
  });

export const messageAdminRoutes = new Elysia({ prefix: "/admin/messages" })
  .use(auth)
  .get("/", ({ query }) => messagesAdmin.list(query), {
    can: "messages:read",
    query: messagesQuerySchema,
  })
  .get("/:id", async ({ params }) => orNotFound(await messagesAdmin.get(params.id)), {
    can: "messages:read",
    params: idParamsSchema,
  })
  .patch("/:id", ({ params, body }) => setMessageStatus(params.id, body.status), {
    can: "messages:write",
    params: idParamsSchema,
    body: messageStatusSchema,
  })
  .delete("/:id", ({ params }) => deleteMessage(params.id), {
    can: "messages:write",
    params: idParamsSchema,
  });
