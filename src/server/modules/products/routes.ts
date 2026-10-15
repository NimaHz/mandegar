import { Elysia } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { rateLimiter } from "@/server/plugins/rate-limit";
import { productsAdmin } from "@/services/admin/products";

import {
  productImagesSchema,
  productInputSchema,
  productLookupQuerySchema,
  productPatchSchema,
  productsQuerySchema,
} from "./schema";
import {
  createProduct,
  deleteProduct,
  lookupProducts,
  setProductImages,
  updateProduct,
} from "./service";

export const productRoutes = new Elysia({ prefix: "/products" })
  .use(rateLimiter)
  .get("/", ({ query }) => lookupProducts(query.locale, query.slugs), {
    query: productLookupQuerySchema,
    rateLimit: { scope: "products", limit: 60, windowSec: 60 },
  });

export const productAdminRoutes = new Elysia({ prefix: "/admin/products" })
  .use(auth)
  .get("/", ({ query }) => productsAdmin.list(query), {
    can: "catalog:read",
    query: productsQuerySchema,
  })
  .get("/options", () => productsAdmin.options(), { can: "catalog:read" })
  .get("/:id", async ({ params }) => orNotFound(await productsAdmin.get(params.id)), {
    can: "catalog:read",
    params: idParamsSchema,
  })
  .post("/", ({ body }) => createProduct(body), { can: "catalog:write", body: productInputSchema })
  .patch("/:id", ({ params, body }) => updateProduct(params.id, body), {
    can: "catalog:write",
    params: idParamsSchema,
    body: productPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteProduct(params.id), {
    can: "catalog:write",
    params: idParamsSchema,
  })
  .put("/:id/images", ({ params, body }) => setProductImages(params.id, body), {
    can: "catalog:write",
    params: idParamsSchema,
    body: productImagesSchema,
  });
