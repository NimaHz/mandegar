import {
  Archive,
  CalendarClock,
  CircleCheckBig,
  CircleX,
  Inbox,
  type LucideIcon,
  MessageCircleQuestion,
  PackageSearch,
  SearchCheck,
  Wrench,
} from "lucide-react";

import { isTicketOpen } from "@/lib/tickets";
import type { PublicTicketMessage, TicketStatus } from "@/types/support";

export type StatusTone = "primary" | "warning" | "success" | "danger" | "chip";

export const statusMeta: Record<TicketStatus, { tone: StatusTone; icon: LucideIcon }> = {
  new: { tone: "primary", icon: Inbox },
  "in-review": { tone: "primary", icon: SearchCheck },
  "awaiting-customer": { tone: "warning", icon: MessageCircleQuestion },
  scheduled: { tone: "primary", icon: CalendarClock },
  "in-repair": { tone: "primary", icon: Wrench },
  "awaiting-parts": { tone: "warning", icon: PackageSearch },
  resolved: { tone: "success", icon: CircleCheckBig },
  closed: { tone: "chip", icon: Archive },
  rejected: { tone: "danger", icon: CircleX },
};

export const statusPath = [
  "new",
  "in-review",
  "scheduled",
  "in-repair",
  "resolved",
  "closed",
] as const satisfies readonly TicketStatus[];

export const sideStatuses = [
  "awaiting-customer",
  "awaiting-parts",
  "rejected",
] as const satisfies readonly TicketStatus[];

const stageOf: Record<TicketStatus, number> = {
  new: 0,
  "in-review": 1,
  "awaiting-customer": 1,
  scheduled: 2,
  "in-repair": 3,
  "awaiting-parts": 3,
  resolved: 4,
  closed: 5,
  rejected: 5,
};

export interface ProgressStep {
  status: TicketStatus;
  state: "done" | "current" | "upcoming";
}

const reachedStage = (messages: PublicTicketMessage[]) =>
  Math.max(
    stageOf.new,
    ...messages.map((message) => {
      if (message.author === "staff") return stageOf["in-review"];
      if (message.author === "system" && isTicketOpen(message.status)) {
        return stageOf[message.status];
      }
      return stageOf.new;
    }),
  );

export const progressSteps = (
  status: TicketStatus,
  messages: PublicTicketMessage[],
): ProgressStep[] => {
  if (!isTicketOpen(status)) {
    const passed = statusPath.slice(0, reachedStage(messages) + 1);
    return [
      ...passed.map((entry): ProgressStep => ({ status: entry, state: "done" })),
      { status, state: "current" },
    ];
  }
  const stage = stageOf[status];
  return statusPath.map((entry, position): ProgressStep => ({
    status: position === stage ? status : entry,
    state: position < stage ? "done" : position === stage ? "current" : "upcoming",
  }));
};

export const toneClasses: Record<StatusTone, { solid: string; soft: string; text: string }> = {
  primary: {
    solid: "bg-primary text-on-primary",
    soft: "bg-primary-soft text-primary",
    text: "text-primary",
  },
  warning: {
    solid: "bg-warning text-white dark:text-night",
    soft: "bg-warning-soft text-warning",
    text: "text-warning",
  },
  success: {
    solid: "bg-success text-white dark:text-night",
    soft: "bg-success-soft text-success",
    text: "text-success",
  },
  danger: {
    solid: "bg-danger text-white dark:text-night",
    soft: "bg-danger-soft text-danger",
    text: "text-danger",
  },
  chip: { solid: "bg-inverse text-on-inverse", soft: "bg-chip text-ink", text: "text-ink-soft" },
};
