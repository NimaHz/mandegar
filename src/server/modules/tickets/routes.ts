import { Elysia, t } from "elysia";

import { issueFormToken } from "@/server/lib/form-guard";
import { orNotFound } from "@/server/lib/http-error";
import { parseOrThrow } from "@/server/lib/parse";
import { idParamsSchema } from "@/server/lib/validation";
import { auth } from "@/server/plugins/auth";
import { rateLimiter } from "@/server/plugins/rate-limit";
import { ticketsAdmin } from "@/services/admin/tickets";

import { serveCustomerAttachment, serveStaffAttachment } from "./attachments";
import {
  staffMessageSchema,
  ticketAttachmentLinkSchema,
  ticketAttachmentParamsSchema,
  ticketFieldsSchema,
  ticketProofSchema,
  ticketReplySchema,
  ticketsQuerySchema,
  ticketTrackSchema,
  ticketUpdateSchema,
} from "./schema";
import { createTicket, replyAsCustomer, replyAsStaff, trackTicket, updateTicket } from "./service";

const text = (maxLength: number) => t.Optional(t.String({ maxLength }));

const attachments = t.Optional(t.Files());

const filesOf = (value: File | File[] | undefined) => (value ? [value].flat() : []);

export const ticketRoutes = new Elysia({ prefix: "/tickets" })
  .use(rateLimiter)
  .get("/form-token", () => ({ token: issueFormToken() }), {
    rateLimit: { scope: "form-token", limit: 60, windowSec: 60 },
  })
  .post(
    "/",
    ({ body, clientKey }) =>
      createTicket(
        parseOrThrow(ticketFieldsSchema, body),
        parseOrThrow(ticketProofSchema, body),
        filesOf(body.attachments),
        clientKey,
      ),
    {
      type: "multipart/form-data",
      body: t.Object({
        type: t.String({ maxLength: 40 }),
        name: t.String({ maxLength: 200 }),
        phone: t.String({ maxLength: 40 }),
        email: text(200),
        province: t.String({ maxLength: 10 }),
        city: t.String({ maxLength: 200 }),
        address: t.String({ maxLength: 600 }),
        warrantyCode: text(40),
        productSlug: text(200),
        purchaseDate: text(20),
        subject: t.String({ maxLength: 300 }),
        description: t.String({ maxLength: 6000 }),
        website: text(200),
        formToken: t.String({ maxLength: 200 }),
        altcha: t.String({ maxLength: 8000 }),
        locale: text(5),
        attachments,
      }),
    },
  )
  .post("/track", ({ body, clientKey }) => trackTicket(body.locale, body, clientKey), {
    body: ticketTrackSchema,
  })
  .get("/attachments/:id", ({ params, query }) => serveCustomerAttachment(params.id, query), {
    params: idParamsSchema,
    query: ticketAttachmentLinkSchema,
  })
  .post(
    "/:trackingCode/messages",
    ({ body, params, clientKey }) => {
      const input = parseOrThrow(ticketReplySchema, body);
      return replyAsCustomer(
        input.locale,
        params.trackingCode,
        input,
        filesOf(body.attachments),
        clientKey,
      );
    },
    {
      type: "multipart/form-data",
      params: t.Object({ trackingCode: t.String({ maxLength: 24 }) }),
      body: t.Object({
        token: t.String({ maxLength: 200 }),
        body: t.String({ maxLength: 6000 }),
        locale: text(5),
        attachments,
      }),
    },
  );

export const ticketAdminRoutes = new Elysia({ prefix: "/admin/tickets" })
  .use(auth)
  .get("/", ({ query }) => ticketsAdmin.list(query), {
    can: "tickets:read",
    query: ticketsQuerySchema,
  })
  .get("/:id", async ({ params }) => orNotFound(await ticketsAdmin.get(params.id)), {
    can: "tickets:read",
    params: idParamsSchema,
  })
  .get(
    "/:id/attachments/:mediaId",
    ({ params }) => serveStaffAttachment(params.id, params.mediaId),
    { can: "tickets:read", params: ticketAttachmentParamsSchema },
  )
  .patch("/:id", ({ actor, params, body }) => updateTicket(actor, params.id, body), {
    can: "tickets:write",
    params: idParamsSchema,
    body: ticketUpdateSchema,
  })
  .post(
    "/:id/messages",
    ({ actor, params, body }) =>
      replyAsStaff(
        actor,
        params.id,
        parseOrThrow(staffMessageSchema, body),
        filesOf(body.attachments),
      ),
    {
      can: "tickets:write",
      params: idParamsSchema,
      body: t.Object({
        body: t.String({ maxLength: 10000 }),
        internal: t.Union([t.Boolean(), t.String({ maxLength: 5 })]),
        status: text(40),
        attachments,
      }),
    },
  );
