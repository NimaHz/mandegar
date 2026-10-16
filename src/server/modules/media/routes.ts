import { Elysia, t } from "elysia";

import { orNotFound } from "@/server/lib/http-error";
import { parseOrThrow } from "@/server/lib/parse";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { mediaAdmin } from "@/services/admin/media";

import { mediaPatchSchema, mediaQuerySchema, mediaUploadFieldsSchema } from "./schema";
import { deleteMedia, updateMediaAlt, uploadMedia } from "./service";

export const mediaAdminRoutes = new Elysia({ prefix: "/admin/media" })
  .use(auth)
  .get("/", ({ query }) => mediaAdmin.list(query), { can: "media:read", query: mediaQuerySchema })
  .get("/:id", async ({ params }) => orNotFound(await mediaAdmin.get(params.id)), {
    can: "media:read",
    params: idParamsSchema,
  })
  .get(
    "/:id/usages",
    async ({ params, actor }) =>
      mediaAdmin.usages(orNotFound(await mediaAdmin.get(params.id)), {
        ticketLabels: actor.permissions.includes("tickets:read"),
      }),
    { can: "media:read", params: idParamsSchema },
  )
  .post(
    "/",
    ({ body, actor }) => {
      const fields = parseOrThrow(mediaUploadFieldsSchema, body);
      return uploadMedia(body.file, { fa: fields.altFa ?? "", en: fields.altEn ?? "" }, actor.id);
    },
    {
      can: "media:write",
      type: "multipart/form-data",
      body: t.Object({
        file: t.File(),
        altFa: t.Optional(t.String({ maxLength: 400 })),
        altEn: t.Optional(t.String({ maxLength: 400 })),
      }),
    },
  )
  .patch("/:id", ({ params, body }) => updateMediaAlt(params.id, body.alt), {
    can: "media:write",
    params: idParamsSchema,
    body: mediaPatchSchema,
  })
  .delete("/:id", ({ params }) => deleteMedia(params.id), {
    can: "media:write",
    params: idParamsSchema,
  });
