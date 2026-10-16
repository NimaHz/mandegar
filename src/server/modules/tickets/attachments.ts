import "server-only";

import { and, arrayContains, eq, exists, type SQL } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { media, ticketMessages } from "@/server/db/schema";
import { safeEqual, sign } from "@/server/lib/crypto";
import { notFound } from "@/server/lib/http-error";
import { getStorage } from "@/server/storage";

const LINK_TTL_SEC = 12 * 3600;
const LINK_STEP_SEC = 3600;

const signatureOf = (mediaId: string, expires: number) =>
  sign(`${mediaId}.${expires}`, "ticket-attachment");

export const staffAttachmentHref = (ticketId: string, mediaId: string) =>
  `/api/admin/tickets/${ticketId}/attachments/${mediaId}`;

export const customerAttachmentHref = (mediaId: string, now = Date.now()) => {
  const expires = Math.ceil(now / 1000 / LINK_STEP_SEC) * LINK_STEP_SEC + LINK_TTL_SEC;
  const query = new URLSearchParams({
    expires: String(expires),
    signature: signatureOf(mediaId, expires),
  });
  return `/api/tickets/attachments/${mediaId}?${query}`;
};

const attachmentOf = async (mediaId: string, message: SQL) => {
  const db = getDb();
  const [row] = await db
    .select({
      kind: media.kind,
      mime: media.mime,
      storageKey: media.storageKey,
      originalName: media.originalName,
    })
    .from(media)
    .where(
      and(
        eq(media.id, mediaId),
        exists(
          db
            .select({ id: ticketMessages.id })
            .from(ticketMessages)
            .where(and(message, arrayContains(ticketMessages.attachmentMediaIds, [mediaId]))),
        ),
      ),
    )
    .limit(1);
  if (!row) throw notFound("Attachment not found");
  return row;
};

const fileNameOf = (row: { kind: string; storageKey: string; originalName: string | null }) => {
  const stored = row.storageKey.split("/").at(-1) ?? "attachment";
  if (!row.originalName) return stored;
  if (row.kind !== "image") return row.originalName;
  return `${row.originalName.replace(/\.[^.]*$/, "")}.${stored.split(".").at(-1) ?? "webp"}`;
};

const dispositionOf = (row: { kind: string; storageKey: string; originalName: string | null }) => {
  const name = fileNameOf(row);
  const fallback = name.replace(/[^\w.-]/g, "_");
  return `${row.kind === "image" ? "inline" : "attachment"}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
};

const respond = async (row: Awaited<ReturnType<typeof attachmentOf>>) => {
  const file = await (await getStorage()).get(row.storageKey, null);
  if (!file) throw notFound("Attachment not found");
  return new Response(file.body, {
    headers: {
      "Content-Type": row.mime,
      "Content-Length": String(file.size),
      "Content-Disposition": dispositionOf(row),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
};

export const serveStaffAttachment = async (ticketId: string, mediaId: string) =>
  respond(await attachmentOf(mediaId, eq(ticketMessages.ticketId, ticketId)));

export const serveCustomerAttachment = async (
  mediaId: string,
  link: { expires: number; signature: string },
) => {
  const valid =
    link.expires * 1000 > Date.now() &&
    safeEqual(link.signature, signatureOf(mediaId, link.expires));
  if (!valid) throw notFound("Attachment not found");
  return respond(await attachmentOf(mediaId, eq(ticketMessages.internal, false)));
};
