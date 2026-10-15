import "server-only";

import { and, count, eq, notInArray } from "drizzle-orm";
import type { z } from "zod";

import type { Locale } from "@/i18n/config";
import { createTrackingCode, formatTrackingCode, parseTrackingCode } from "@/lib/tracking-code";
import { parseWarrantyCode } from "@/lib/warranty-code";
import { hasPermission } from "@/server/auth/permissions";
import { type Executor, getDb } from "@/server/db/client";
import { products, ticketMessages, tickets, users, warrantyCodes } from "@/server/db/schema";
import { randomToken, sha256 } from "@/server/lib/crypto";
import { isUniqueViolation } from "@/server/lib/db-errors";
import { assertHuman, type HumanProof } from "@/server/lib/form-guard";
import { conflict, notFound, orNotFound, ValidationFailure } from "@/server/lib/http-error";
import { enforceRateLimit, isRateLimited, rateLimit } from "@/server/lib/rate-limit";
import { ticketDeadlines } from "@/server/lib/sla";
import { ingestFile } from "@/server/modules/media/service";
import { notify } from "@/server/notify";
import type { AdminActor } from "@/server/plugins/auth";
import { ticketsAdmin } from "@/services/admin/tickets";
import {
  findTicketByToken,
  isTicketOpen,
  loadPublicTicket,
  supportService,
} from "@/services/db/support";
import type { PublicTicket, TicketReceipt, TicketStatus, TrackTicketInput } from "@/types/support";

import {
  mentionsGasSmell,
  type staffMessageSchema,
  TICKET_ATTACHMENT_LIMIT,
  TICKET_ATTACHMENT_MAX_BYTES,
  ticketAttachmentTypes,
  type ticketFieldsSchema,
  type ticketUpdateSchema,
} from "./schema";

type TicketFields = z.output<typeof ticketFieldsSchema>;

const OPEN_TICKETS_PER_PHONE = 3;
const RESOLVED_STATUSES: TicketStatus[] = ["resolved", "closed", "rejected"];
const TRACK_FAILURES = { limit: 20, windowSec: 600 };

const ingestAttachments = async (files: File[]) => {
  if (files.length > TICKET_ATTACHMENT_LIMIT) {
    throw new ValidationFailure({ attachments: `At most ${TICKET_ATTACHMENT_LIMIT} files` });
  }
  const ids: string[] = [];
  for (const file of files) {
    const row = await ingestFile(file, {
      kinds: ["image", "document"],
      allowedMimes: ticketAttachmentTypes,
      limits: { image: TICKET_ATTACHMENT_MAX_BYTES, document: TICKET_ATTACHMENT_MAX_BYTES },
    });
    ids.push(row.id);
  }
  return ids;
};

const resolveWarrantyCode = async (input: string | undefined) => {
  if (!input) return { codeId: null, productId: null, unknown: null };
  const parsed = parseWarrantyCode(input);
  if (!parsed.valid)
    throw new ValidationFailure({ warrantyCode: `Invalid warranty code (${parsed.reason})` });
  const [row] = await getDb()
    .select({ id: warrantyCodes.id, productId: warrantyCodes.productId })
    .from(warrantyCodes)
    .where(eq(warrantyCodes.code, parsed.code));
  return row
    ? { codeId: row.id, productId: row.productId, unknown: null }
    : { codeId: null, productId: null, unknown: parsed.code };
};

const resolveProductId = async (slug: string | undefined) => {
  if (!slug) return null;
  const [row] = await getDb()
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.slug, slug), eq(products.status, "published")));
  return row?.id ?? null;
};

const assertPhoneCapacity = async (phone: string) => {
  const [row] = await getDb()
    .select({ total: count() })
    .from(tickets)
    .where(and(eq(tickets.phone, phone), notInArray(tickets.status, RESOLVED_STATUSES)));
  if ((row?.total ?? 0) >= OPEN_TICKETS_PER_PHONE) {
    throw conflict("Too many open requests for this phone number", "LIMIT_REACHED");
  }
};

const insertTicket = async (
  values: Omit<typeof tickets.$inferInsert, "trackingCode">,
  write: (executor: Executor, ticketId: string) => Promise<void>,
) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const trackingCode = createTrackingCode();
    try {
      return await getDb().transaction(async (tx) => {
        const [row] = await tx
          .insert(tickets)
          .values({ ...values, trackingCode })
          .returning();
        if (!row) throw new Error("Ticket insert failed");
        await write(tx, row.id);
        return row;
      });
    } catch (error) {
      if (!isUniqueViolation(error, "tickets_tracking_code_unique")) throw error;
    }
  }
  throw new Error("Could not allocate a tracking code");
};

export const createTicket = async (
  fields: TicketFields,
  proof: HumanProof,
  files: File[],
  clientKey: string,
): Promise<TicketReceipt> => {
  await assertHuman(proof);
  await enforceRateLimit(`ticket:${clientKey}`, 5, 3600);
  await assertPhoneCapacity(fields.phone);
  const warranty = await resolveWarrantyCode(fields.warrantyCode);
  const productId = warranty.productId ?? (await resolveProductId(fields.productSlug));
  const attachmentMediaIds = await ingestAttachments(files);
  const urgent = mentionsGasSmell(`${fields.subject} ${fields.description}`);
  const accessToken = randomToken(32);
  const createdAt = new Date();
  const row = await insertTicket(
    {
      accessTokenHash: sha256(accessToken),
      type: fields.type,
      priority: urgent ? "urgent" : "normal",
      name: fields.name,
      phone: fields.phone,
      email: fields.email ?? null,
      province: fields.province,
      city: fields.city,
      address: fields.address,
      warrantyCodeId: warranty.codeId,
      productId,
      purchaseDate: fields.purchaseDate ?? null,
      subject: fields.subject,
      description: fields.description,
      ...ticketDeadlines(fields.type, createdAt),
      createdAt,
    },
    async (executor, ticketId) => {
      await executor.insert(ticketMessages).values([
        {
          ticketId,
          authorType: "customer",
          body: fields.description,
          attachmentMediaIds,
          createdAt,
        },
        ...(warranty.unknown
          ? [
              {
                ticketId,
                authorType: "system" as const,
                internal: true,
                body: `Warranty code ${warranty.unknown} was entered but not found.`,
              },
            ]
          : []),
      ]);
    },
  );
  await notify({
    template: "ticket-received",
    recipient: row.phone,
    tokens: [formatTrackingCode(row.trackingCode)],
  });
  return { trackingCode: row.trackingCode, accessToken, urgent };
};

export const trackTicket = async (
  locale: Locale,
  input: TrackTicketInput,
  clientKey: string,
): Promise<PublicTicket> => {
  const key = `ticket-track-fail:${clientKey}`;
  if (await isRateLimited(key, TRACK_FAILURES.limit, TRACK_FAILURES.windowSec)) {
    await enforceRateLimit(key, TRACK_FAILURES.limit, TRACK_FAILURES.windowSec);
  }
  const ticket = await supportService.track(locale, input);
  if (!ticket) {
    await rateLimit(key, TRACK_FAILURES.limit, TRACK_FAILURES.windowSec);
    throw notFound("Request not found");
  }
  return ticket;
};

export const replyAsCustomer = async (
  locale: Locale,
  trackingCode: string,
  input: { token: string; body: string },
  files: File[],
  clientKey: string,
): Promise<PublicTicket> => {
  await enforceRateLimit(`ticket-reply:${clientKey}`, 20, 3600);
  const code = parseTrackingCode(trackingCode);
  const row = code ? await findTicketByToken(input.token) : undefined;
  if (!row || row.trackingCode !== code) throw notFound("Request not found");
  if (!isTicketOpen(row.status)) throw conflict("This request is closed");
  const attachmentMediaIds = await ingestAttachments(files);
  await getDb().transaction(async (tx) => {
    await tx
      .insert(ticketMessages)
      .values({ ticketId: row.id, authorType: "customer", body: input.body, attachmentMediaIds });
    await tx
      .update(tickets)
      .set({
        status: row.status === "awaiting-customer" ? "in-review" : row.status,
        updatedAt: new Date(),
      })
      .where(eq(tickets.id, row.id));
  });
  const ticket = await loadPublicTicket(row.id, locale, true);
  if (!ticket) throw notFound("Request not found");
  return ticket;
};

const assertAssignee = async (assigneeId: string | null | undefined) => {
  if (!assigneeId) return;
  const [user] = await getDb()
    .select({ role: users.role, active: users.active })
    .from(users)
    .where(eq(users.id, assigneeId));
  if (!user?.active || !hasPermission(user.role, "tickets:write")) {
    throw new ValidationFailure({ assigneeId: "Choose an active support user" });
  }
};

const statusTimestamps = (
  status: TicketStatus,
  now: Date,
  current: { resolvedAt: Date | null; closedAt: Date | null },
) => {
  if (status === "resolved") return { resolvedAt: current.resolvedAt ?? now, closedAt: null };
  if (status === "closed" || status === "rejected") {
    return { resolvedAt: current.resolvedAt, closedAt: current.closedAt ?? now };
  }
  return { resolvedAt: null, closedAt: null };
};

const requireTicket = async (id: string) => {
  const [row] = await getDb().select().from(tickets).where(eq(tickets.id, id));
  if (!row) throw notFound("Ticket not found");
  return row;
};

export const updateTicket = async (
  actor: AdminActor,
  id: string,
  input: z.output<typeof ticketUpdateSchema>,
) => {
  const before = await requireTicket(id);
  await assertAssignee(input.assigneeId);
  const now = new Date();
  const statusChanged = input.status !== undefined && input.status !== before.status;
  await getDb().transaction(async (tx) => {
    await tx
      .update(tickets)
      .set({
        ...input,
        ...(statusChanged && input.status ? statusTimestamps(input.status, now, before) : {}),
        updatedAt: now,
      })
      .where(eq(tickets.id, id));
    if (statusChanged && input.status) {
      await tx.insert(ticketMessages).values({
        ticketId: id,
        authorType: "system",
        authorId: actor.id,
        body: `status:${input.status}`,
      });
    }
  });
  if (statusChanged && input.status) {
    await notify({
      template: "ticket-updated",
      recipient: before.phone,
      tokens: [formatTrackingCode(before.trackingCode), input.status],
    });
  }
  return orNotFound(await ticketsAdmin.get(id));
};

export const replyAsStaff = async (
  actor: AdminActor,
  id: string,
  input: z.output<typeof staffMessageSchema>,
) => {
  const before = await requireTicket(id);
  const now = new Date();
  await getDb().transaction(async (tx) => {
    await tx.insert(ticketMessages).values({
      ticketId: id,
      authorType: "staff",
      authorId: actor.id,
      body: input.body,
      internal: input.internal,
    });
    await tx
      .update(tickets)
      .set(
        input.internal
          ? { updatedAt: now }
          : {
              updatedAt: now,
              firstRespondedAt: before.firstRespondedAt ?? now,
              status: before.status === "new" ? "in-review" : before.status,
            },
      )
      .where(eq(tickets.id, id));
  });
  if (!input.internal) {
    await notify({
      template: "ticket-updated",
      recipient: before.phone,
      tokens: [formatTrackingCode(before.trackingCode)],
    });
  }
  return orNotFound(await ticketsAdmin.get(id));
};
