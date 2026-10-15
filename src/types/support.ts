export const ticketTypes = [
  "warranty-repair",
  "repair",
  "spare-parts",
  "technical",
  "complaint",
  "suggestion",
] as const;
export type TicketType = (typeof ticketTypes)[number];

export const ticketStatuses = [
  "new",
  "in-review",
  "awaiting-customer",
  "scheduled",
  "in-repair",
  "awaiting-parts",
  "resolved",
  "closed",
  "rejected",
] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export const isTicketStatus = (value: string): value is TicketStatus =>
  ticketStatuses.some((status) => status === value);

export const ticketPriorities = ["low", "normal", "high", "urgent"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export const contactDepartments = ["general", "sales", "support", "partnership", "export"] as const;
export type ContactDepartment = (typeof contactDepartments)[number];

export interface PublicTicketPost {
  id: string;
  author: "customer" | "staff";
  body: string;
  attachments: { href: string; name: string; mime: string }[];
  createdAt: string;
}

export interface PublicTicketStatusChange {
  id: string;
  author: "system";
  status: TicketStatus;
  createdAt: string;
}

export type PublicTicketMessage = PublicTicketPost | PublicTicketStatusChange;

export interface PublicTicket {
  trackingCode: string;
  type: TicketType;
  status: TicketStatus;
  subject: string;
  maskedPhone: string;
  product: { slug: string; name: string; modelCode: string } | null;
  warrantyCode: string | null;
  messages: PublicTicketMessage[];
  createdAt: string;
  updatedAt: string;
  canReply: boolean;
}

export interface TicketReceipt {
  trackingCode: string;
  accessToken: string;
  urgent: boolean;
}

export type TrackTicketInput = { trackingCode: string; phone: string } | { token: string };
