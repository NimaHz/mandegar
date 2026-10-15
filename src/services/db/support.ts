import "server-only";

import { and, asc, eq, type SQL } from "drizzle-orm";

import type { Locale } from "@/i18n/config";
import { maskMobile, normalizeMobile } from "@/lib/persian";
import { routes } from "@/lib/routes";
import { parseTrackingCode } from "@/lib/tracking-code";
import { formatWarrantyCode } from "@/lib/warranty-code";
import { getDb } from "@/server/db/client";
import { ticketMessages, tickets } from "@/server/db/schema";
import { safeEqual, sha256 } from "@/server/lib/crypto";
import type { PublicTicket, TicketStatus } from "@/types/support";

import type { SupportService } from "../contracts";
import { iso, mediaIndex, pick } from "./mappers";

const CLOSED_STATUSES: readonly TicketStatus[] = ["closed", "rejected"];

export const isTicketOpen = (status: TicketStatus) => !CLOSED_STATUSES.includes(status);

const findTicket = (where: SQL) =>
  getDb().query.tickets.findFirst({
    where: () => where,
    with: { product: { with: { category: true, brand: true } }, warrantyCode: true },
  });

type TicketRow = NonNullable<Awaited<ReturnType<typeof findTicket>>>;

const publicMessages = async (ticketId: string) => {
  const rows = await getDb()
    .select()
    .from(ticketMessages)
    .where(and(eq(ticketMessages.ticketId, ticketId), eq(ticketMessages.internal, false)))
    .orderBy(asc(ticketMessages.createdAt));
  const files = await mediaIndex(rows.flatMap((row) => row.attachmentMediaIds));
  return rows.map((row) => ({
    id: row.id,
    author: row.authorType,
    body: row.body,
    attachments: row.attachmentMediaIds.flatMap((id) => {
      const file = files.get(id);
      return file
        ? [
            {
              href: routes.upload(file.storageKey),
              name: file.originalName ?? file.storageKey,
              mime: file.mime,
            },
          ]
        : [];
    }),
    createdAt: iso(row.createdAt),
  }));
};

const isProductListed = (product: TicketRow["product"]) =>
  product !== null &&
  product.status === "published" &&
  product.category.published &&
  product.brand.published;

const toPublicTicket = async (
  row: TicketRow,
  locale: Locale,
  viaToken: boolean,
): Promise<PublicTicket> => ({
  trackingCode: row.trackingCode,
  type: row.type,
  status: row.status,
  subject: row.subject,
  maskedPhone: maskMobile(row.phone),
  product:
    row.product && isProductListed(row.product)
      ? {
          slug: row.product.slug,
          name: pick(row.product.name, locale),
          modelCode: row.product.modelCode,
        }
      : null,
  warrantyCode: row.warrantyCode ? formatWarrantyCode(row.warrantyCode.code) : null,
  messages: await publicMessages(row.id),
  createdAt: iso(row.createdAt),
  updatedAt: iso(row.updatedAt),
  canReply: viaToken && isTicketOpen(row.status),
});

export const findTicketByToken = (token: string) =>
  token.length >= 20 && token.length <= 100
    ? findTicket(eq(tickets.accessTokenHash, sha256(token)))
    : Promise.resolve(undefined);

const findTicketByCode = async (trackingCode: string, phone: string) => {
  const code = parseTrackingCode(trackingCode);
  const mobile = normalizeMobile(phone);
  if (!code || !mobile) return undefined;
  const row = await findTicket(eq(tickets.trackingCode, code));
  return row && safeEqual(row.phone, mobile) ? row : undefined;
};

export const loadPublicTicket = async (id: string, locale: Locale, viaToken: boolean) => {
  const row = await findTicket(eq(tickets.id, id));
  return row ? toPublicTicket(row, locale, viaToken) : null;
};

export const supportService: SupportService = {
  track: async (locale, input) => {
    const viaToken = "token" in input;
    const row = viaToken
      ? await findTicketByToken(input.token)
      : await findTicketByCode(input.trackingCode, input.phone);
    return row ? toPublicTicket(row, locale, viaToken) : null;
  },
};
