import type { TicketType } from "@/types/support";

const DAY_MS = 86_400_000;

const weekday = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Tehran", weekday: "short" });

const isWeekend = (date: Date) => weekday.format(date) === "Fri";

const resolutionDays: Record<TicketType, number> = {
  "warranty-repair": 7,
  repair: 10,
  "spare-parts": 5,
  technical: 2,
  complaint: 3,
  suggestion: 10,
};

const addBusinessDays = (start: Date, days: number) => {
  let date = new Date(start.getTime());
  let remaining = days;
  while (remaining > 0) {
    date = new Date(date.getTime() + DAY_MS);
    if (!isWeekend(date)) remaining -= 1;
  }
  return date;
};

export const ticketDeadlines = (type: TicketType, createdAt: Date) => ({
  firstResponseDue: addBusinessDays(createdAt, 1),
  resolutionDue: addBusinessDays(createdAt, resolutionDays[type]),
});
