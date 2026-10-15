import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { security } from "@/server/plugins/security";
import { warrantyCodesAdmin, warrantyPoliciesAdmin } from "@/services/admin/warranty";

import {
  warrantyCodesQuerySchema,
  warrantyCodeStatusSchema,
  warrantyGenerateSchema,
  warrantyLabelsQuerySchema,
  warrantyLookupSchema,
  warrantyPoliciesQuerySchema,
  warrantyPolicyInputSchema,
  warrantyPolicyPatchSchema,
} from "./schema";
import {
  createWarrantyPolicy,
  deleteWarrantyPolicy,
  exportWarrantyCodes,
  generateBatchCode,
  lookupWarranty,
  setWarrantyCodeStatus,
  updateWarrantyPolicy,
} from "./service";

export const warrantyRoutes = new Elysia({ prefix: "/warranty" })
  .use(security)
  .post("/lookup", ({ body, clientKey }) => lookupWarranty(body.locale, body.code, clientKey), {
    body: warrantyLookupSchema,
  });

export const warrantyPolicyAdminRoutes = new Elysia({ prefix: "/admin/warranty-policies" })
  .use(auth)
  .get("/", ({ query }) => warrantyPoliciesAdmin.list(query), {
    can: "warranty:read",
    query: warrantyPoliciesQuerySchema,
  })
  .get("/options", () => warrantyPoliciesAdmin.options(), { can: "warranty:read" })
  .get("/:id", async ({ params }) => orNotFound(await warrantyPoliciesAdmin.get(params.id)), {
    can: "warranty:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createWarrantyPolicy(body), {
    can: "warranty:policies",
    body: warrantyPolicyInputSchema,
  })
  .patch("/:id", ({ params, body }) => updateWarrantyPolicy(params.id, body), {
    can: "warranty:policies",
    params: idParamsSchema,
    body: warrantyPolicyPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteWarrantyPolicy(params.id), {
    can: "warranty:policies",
    params: idParamsSchema,
  });

export const warrantyCodeAdminRoutes = new Elysia({ prefix: "/admin/warranty-codes" })
  .use(auth)
  .get("/", ({ query }) => warrantyCodesAdmin.list(query), {
    can: "warranty:read",
    query: warrantyCodesQuerySchema,
  })
  .get("/labels", ({ query }) => warrantyCodesAdmin.byIds(query.ids), {
    can: "warranty:read",
    query: warrantyLabelsQuerySchema,
  })
  .get(
    "/export",
    async ({ query }) =>
      new Response(await exportWarrantyCodes(query), {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": 'attachment; filename="warranty-codes.csv"',
          "cache-control": "no-store",
        },
      }),
    { can: "warranty:read", query: warrantyCodesQuerySchema },
  )
  .get("/:id", async ({ params }) => orNotFound(await warrantyCodesAdmin.get(params.id)), {
    can: "warranty:read",
    params: idParamsSchema,
  })
  .post("/generate", ({ body }) => generateBatchCode(body), {
    can: "warranty:write",
    body: warrantyGenerateSchema,
  })
  .patch("/:id/status", ({ params, body }) => setWarrantyCodeStatus(params.id, body), {
    can: "warranty:write",
    params: idParamsSchema,
    body: warrantyCodeStatusSchema,
  });
