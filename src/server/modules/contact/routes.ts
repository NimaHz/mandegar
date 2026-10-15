import { Elysia } from "elysia";

import { security } from "@/server/plugins/security";

import { contactRequestSchema } from "./schema";
import { submitContact } from "./service";

export const contactRoutes = new Elysia()
  .use(security)
  .post("/contact", ({ body, clientKey }) => submitContact(body, clientKey), {
    body: contactRequestSchema,
  });
