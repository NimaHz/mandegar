import { Elysia } from "elysia";

import { security } from "@/server/plugins/security";

import { warrantyLookupSchema } from "./schema";
import { lookupWarranty } from "./service";

export const warrantyRoutes = new Elysia({ prefix: "/warranty" })
  .use(security)
  .post("/lookup", ({ body, clientKey }) => lookupWarranty(body.locale, body.code, clientKey), {
    body: warrantyLookupSchema,
  });
