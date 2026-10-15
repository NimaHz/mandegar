import { MB } from "@/lib/format";
import { normalizeFa } from "@/lib/persian";
import { type TicketStatus, ticketStatuses } from "@/types/support";

export const TICKET_ATTACHMENT_LIMIT = 5;
export const TICKET_ATTACHMENT_MAX_BYTES = 5 * MB;
export const ticketAttachmentTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
export const TICKET_ATTACHMENT_ACCEPT = ticketAttachmentTypes.join(",");

const ATTACHMENT_EXTENSIONS = /\.(jpe?g|png|webp|pdf)$/i;

export const isAcceptedAttachment = (file: File) =>
  ticketAttachmentTypes.some((type) => type === file.type) ||
  (file.type === "" && ATTACHMENT_EXTENSIONS.test(file.name));

export const attachmentKey = (file: File) => `${file.name}-${file.size}-${file.lastModified}`;

export type AttachmentProblem = { kind: "type" | "size"; name: string } | { kind: "count" };

export const screenAttachments = (current: File[], incoming: File[]) => {
  const known = new Set(current.map(attachmentKey));
  const accepted: File[] = [];
  const problems: AttachmentProblem[] = [];
  for (const file of incoming) {
    const key = attachmentKey(file);
    if (known.has(key)) continue;
    if (!isAcceptedAttachment(file)) {
      problems.push({ kind: "type", name: file.name });
      continue;
    }
    if (file.size > TICKET_ATTACHMENT_MAX_BYTES) {
      problems.push({ kind: "size", name: file.name });
      continue;
    }
    if (current.length + accepted.length >= TICKET_ATTACHMENT_LIMIT) {
      problems.push({ kind: "count" });
      break;
    }
    known.add(key);
    accepted.push(file);
  }
  return { accepted, problems };
};

const GAS_SMELL = /بو(ی)?\s*گاز|gas\s*(smell|leak)|smell(s|ing)?\s+(of\s+)?gas/i;

export const mentionsGasSmell = (text: string) =>
  GAS_SMELL.test(normalizeFa(text).replace(/‌/g, " "));

const STATUS_EVENT_PREFIX = "status:";

export const statusEventBody = (status: TicketStatus) => `${STATUS_EVENT_PREFIX}${status}`;

export const parseStatusEvent = (body: string): TicketStatus | null => {
  if (!body.startsWith(STATUS_EVENT_PREFIX)) return null;
  const value = body.slice(STATUS_EVENT_PREFIX.length);
  return ticketStatuses.find((status) => status === value) ?? null;
};
