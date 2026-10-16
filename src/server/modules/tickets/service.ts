import "server-only";

import { and, count, eq, inArray, notInArray, sql } from "drizzle-orm";
import type { z } from "zod";

import { ticketStatusCopy } from "@/features/support/content";
import type { Locale } from "@/i18n/config";
import { MB } from "@/lib/format";
import {
  isTicketOpen,
  mentionsGasSmell,
  statusEventBody,
  TICKET_ATTACHMENT_LIMIT,
  TICKET_ATTACHMENT_MAX_BYTES,
  ticketAttachmentTypes,
  unknownWarrantyBody,
} from "@/lib/tickets";
import { createTrackingCode, formatTrackingCode, parseTrackingCode } from "@/lib/tracking-code";
import { parseWarrantyCode } from "@/lib/warranty-code";
import { hasPermission } from "@/server/auth/permissions";
import { type Executor, getDb } from "@/server/db/client";
import { media, products, ticketMessages, tickets, users, warrantyCodes } from "@/server/db/schema";
import { randomToken, sha256 } from "@/server/lib/crypto";
import { isUniqueViolation } from "@/server/lib/db-errors";
import { assertHuman, type HumanProof } from "@/server/lib/form-guard";
import {
  conflict,
  notFound,
  orNotFound,
  payloadTooLarge,
  tooManyRequests,
  ValidationFailure,
} from "@/server/lib/http-error";
import { enforceRateLimit, reserveAttempts } from "@/server/lib/rate-limit";
import { ticketDeadlines } from "@/server/lib/sla";
import { ingestFile } from "@/server/modules/media/service";
import { notify } from "@/server/notify";
import type { AdminActor } from "@/server/plugins/auth";
import { getStorage } from "@/server/storage";
import { ticketsAdmin } from "@/services/admin/tickets";
import { findTicketByToken, loadPublicTicket, supportService } from "@/services/db/support";
import type { PublicTicket, TicketReceipt, TicketStatus, TrackTicketInput } from "@/types/support";

import type { staffMessageSchema, ticketFieldsSchema, ticketUpdateSchema } from "./schema";

type TicketFields = z.output<typeof ticketFieldsSchema>;
type TicketRow = typeof tickets.$inferSelect;

const OPEN_TICKETS_PER_PHONE = 3;
const RESOLVED_STATUSES: TicketStatus[] = ["resolved", "closed", "rejected"];
const REOPENED_STATUSES: TicketStatus[] = ["awaiting-customer", "resolved"];
const TRACK_FAILURES = { limit: 20, windowSec: 600 };

const assertAttachments = (files: File[]) => {
  if (files.length > TICKET_ATTACHMENT_LIMIT) {
    throw payloadTooLarge(`At most ${TICKET_ATTACHMENT_LIMIT} attachments`);
  }
  if (files.some((file) => file.size > TICKET_ATTACHMENT_MAX_BYTES)) {
    throw payloadTooLarge(`Each attachment must be at most ${TICKET_ATTACHMENT_MAX_BYTES / MB} MB`);
  }
};

const discardAttachments = async (ids: string[]) => {
  if (ids.length === 0) return;
  const rows = await getDb()
    .delete(media)
    .where(inArray(media.id, ids))
    .returning({ storageKey: media.storageKey });
  const storage = await getStorage();
  await Promise.all(rows.map((row) => storage.remove(row.storageKey)));
};

const withAttachments = async <TResult>(
  files: File[],
  uploadedBy: string | null,
  write: (attachmentMediaIds: string[]) => Promise<TResult>,
) => {
  const ids: string[] = [];
  try {
    for (const file of files) {
      const row = await ingestFile(file, {
        kinds: ["image", "document"],
        allowedMimes: ticketAttachmentTypes,
        limits: { image: TICKET_ATTACHMENT_MAX_BYTES, document: TICKET_ATTACHMENT_MAX_BYTES },
        uploadedBy,
        scope: "ticket",
      });
      ids.push(row.id);
    }
    return await write(ids);
  } catch (error) {
    await discardAttachments(ids).catch((failure: unknown) => console.error(failure));
    throw error;
  }
};

const notifyUpdate = (ticket: TicketRow, status: TicketStatus) =>
  notify({
    template: "ticket-updated",
    recipient: ticket.phone,
    tokens: [formatTrackingCode(ticket.trackingCode), ticketStatusCopy.fa[status].label],
  });

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

const assertPhoneCapacity = async (executor: Executor, phone: string) => {
  const [row] = await executor
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
        await tx.execute(
          sql`select pg_advisory_xact_lock(hashtextextended(${`ticket-phone:${values.phone}`}, 0))`,
        );
        await assertPhoneCapacity(tx, values.phone);
        const [row] = await tx
          .insert(tickets)
          .values({ ...values, trackingCode })
          .returning();
        if (!row) throw new Error("Ticket insert failed");
        await write(tx, row.id);
        return row;
      });
    } catch (error) {
      if (!isUniqueViolation(error, tickets.trackingCode.uniqueName)) throw error;
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
  assertAttachments(files);
  await assertHuman(proof);
  await enforceRateLimit(`ticket:${clientKey}`, 5, 3600);
  await assertPhoneCapacity(getDb(), fields.phone);
  const warranty = await resolveWarrantyCode(fields.warrantyCode);
  const productId = warranty.productId ?? (await resolveProductId(fields.productSlug));
  const urgent = mentionsGasSmell(`${fields.subject} ${fields.description}`);
  const accessToken = randomToken(32);
  const createdAt = new Date();
  const row = await withAttachments(files, null, (attachmentMediaIds) =>
    insertTicket(
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
                  body: unknownWarrantyBody(warranty.unknown),
                },
              ]
            : []),
        ]);
      },
    ),
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
  const attempt = await reserveAttempts([
    { key: `ticket-track-fail:${clientKey}`, ...TRACK_FAILURES },
  ]);
  if (!attempt.allowed) throw tooManyRequests(attempt.retryAfterSec);
  const ticket = await supportService.track(locale, input);
  if (!ticket) throw notFound("Request not found");
  await attempt.release();
  return ticket;
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

const lockTicket = async (executor: Executor, id: string) => {
  const [row] = await executor.select().from(tickets).where(eq(tickets.id, id)).for("update");
  if (!row) throw notFound("Ticket not found");
  return row;
};

interface StatusMove {
  status: TicketStatus;
  at: Date;
  authorId: string | null;
  logged: boolean;
}

const canWorkTickets = async (executor: Executor, userId: string) => {
  const [user] = await executor
    .select({ role: users.role, active: users.active })
    .from(users)
    .where(eq(users.id, userId))
    .for("share");
  return Boolean(user?.active && hasPermission(user.role, "tickets:write"));
};

const moveTicket = async (
  executor: Executor,
  current: TicketRow,
  move: StatusMove,
  values: Partial<typeof tickets.$inferInsert> = {},
) => {
  const changed = move.status !== current.status;
  const reopened =
    changed &&
    RESOLVED_STATUSES.includes(current.status) &&
    !RESOLVED_STATUSES.includes(move.status);
  const orphaned =
    reopened &&
    values.assigneeId === undefined &&
    current.assigneeId !== null &&
    !(await canWorkTickets(executor, current.assigneeId));
  await executor
    .update(tickets)
    .set({
      ...values,
      ...(orphaned ? { assigneeId: null } : {}),
      ...(changed
        ? { status: move.status, ...statusTimestamps(move.status, move.at, current) }
        : {}),
      updatedAt: move.at,
    })
    .where(eq(tickets.id, current.id));
  if (changed && move.logged) {
    await executor.insert(ticketMessages).values({
      ticketId: current.id,
      authorType: "system",
      authorId: move.authorId,
      body: statusEventBody(move.status),
      createdAt: move.at,
    });
  }
  return changed;
};

const afterMessage = (sentAt: Date) => new Date(sentAt.getTime() + 1);

export const replyAsCustomer = async (
  locale: Locale,
  trackingCode: string,
  input: { token: string; body: string },
  files: File[],
  clientKey: string,
): Promise<PublicTicket> => {
  assertAttachments(files);
  await enforceRateLimit(`ticket-reply:${clientKey}`, 20, 3600);
  const code = parseTrackingCode(trackingCode);
  const row = code ? await findTicketByToken(input.token) : undefined;
  if (!row || row.trackingCode !== code) throw notFound("Request not found");
  if (!isTicketOpen(row.status)) throw conflict("This request is closed");
  await withAttachments(files, null, (attachmentMediaIds) =>
    getDb().transaction(async (tx) => {
      const current = await lockTicket(tx, row.id);
      if (!isTicketOpen(current.status)) throw conflict("This request is closed");
      const sentAt = new Date();
      await tx.insert(ticketMessages).values({
        ticketId: row.id,
        authorType: "customer",
        body: input.body,
        attachmentMediaIds,
        createdAt: sentAt,
      });
      await moveTicket(tx, current, {
        status: REOPENED_STATUSES.includes(current.status) ? "in-review" : current.status,
        at: afterMessage(sentAt),
        authorId: null,
        logged: current.status === "resolved",
      });
    }),
  );
  const ticket = await loadPublicTicket(row.id, locale, true);
  if (!ticket) throw notFound("Request not found");
  return ticket;
};

const assertAssignee = async (executor: Executor, assigneeId: string | null | undefined) => {
  if (!assigneeId) return;
  if (!(await canWorkTickets(executor, assigneeId))) {
    throw new ValidationFailure({ assigneeId: "Choose an active support user" });
  }
};

export const updateTicket = async (
  actor: AdminActor,
  id: string,
  input: z.output<typeof ticketUpdateSchema>,
) => {
  await requireTicket(id);
  const { status, ...fields } = input;
  const moved = await getDb().transaction(async (tx) => {
    await assertAssignee(tx, input.assigneeId);
    const current = await lockTicket(tx, id);
    const next = status ?? current.status;
    const changed = await moveTicket(
      tx,
      current,
      { status: next, at: new Date(), authorId: actor.id, logged: true },
      fields,
    );
    return changed ? { ticket: current, status: next } : null;
  });
  if (moved) await notifyUpdate(moved.ticket, moved.status);
  return orNotFound(await ticketsAdmin.get(id));
};

export const replyAsStaff = async (
  actor: AdminActor,
  id: string,
  input: z.output<typeof staffMessageSchema>,
  files: File[],
) => {
  assertAttachments(files);
  await requireTicket(id);
  const sent = await withAttachments(files, actor.id, (attachmentMediaIds) =>
    getDb().transaction(async (tx) => {
      const current = await lockTicket(tx, id);
      const sentAt = new Date();
      await tx.insert(ticketMessages).values({
        ticketId: id,
        authorType: "staff",
        authorId: actor.id,
        body: input.body,
        internal: input.internal,
        attachmentMediaIds,
        createdAt: sentAt,
      });
      const status =
        input.status ??
        (!input.internal && current.status === "new" ? "in-review" : current.status);
      const changed = await moveTicket(
        tx,
        current,
        {
          status,
          at: afterMessage(sentAt),
          authorId: actor.id,
          logged: input.status !== undefined,
        },
        input.internal ? {} : { firstRespondedAt: current.firstRespondedAt ?? sentAt },
      );
      return { ticket: current, status, changed };
    }),
  );
  if (!input.internal || sent.changed) await notifyUpdate(sent.ticket, sent.status);
  return orNotFound(await ticketsAdmin.get(id));
};
