import { normalizeFa } from "@/lib/persian";

const WEEK = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

type Weekday = (typeof WEEK)[number];

interface OpeningRule {
  days: Weekday[];
  opens: string;
  closes: string;
}

const DAY_NAMES: Record<string, Weekday> = {
  saturday: "Saturday",
  sat: "Saturday",
  شنبه: "Saturday",
  sunday: "Sunday",
  sun: "Sunday",
  یکشنبه: "Sunday",
  monday: "Monday",
  mon: "Monday",
  دوشنبه: "Monday",
  tuesday: "Tuesday",
  tue: "Tuesday",
  سهشنبه: "Tuesday",
  wednesday: "Wednesday",
  wed: "Wednesday",
  چهارشنبه: "Wednesday",
  thursday: "Thursday",
  thu: "Thursday",
  پنجشنبه: "Thursday",
  friday: "Friday",
  fri: "Friday",
  جمعه: "Friday",
};

const SEGMENT_SEPARATOR = /[,،;؛]/;
const DAY = "([a-z]+|[\\u0600-\\u06ff]+)";
const RANGE = "\\s*(?:to|-|–|—|تا)\\s*";
const TIME = "(\\d{1,2}(?::\\d{2})?)";
const OPEN_SEGMENT = new RegExp(`^${DAY}(?:${RANGE}${DAY})?\\s*:?\\s*${TIME}${RANGE}${TIME}$`);
const CLOSED_SEGMENT = new RegExp(`^${DAY}(?:${RANGE}${DAY})?\\s*:?\\s*(?:closed|تعطیل)$`);

const normalize = (text: string) =>
  normalizeFa(text)
    .toLowerCase()
    .replace(/[‌‏‎]/g, "")
    .replace(/(یک|دو|سه|چهار|پنج)\s+شنبه/g, "$1شنبه")
    .replace(/\s+/g, " ")
    .trim();

const dayRange = (from: string, to: string | undefined): Weekday[] | null => {
  const start = DAY_NAMES[from];
  const end = to === undefined ? start : DAY_NAMES[to];
  if (!start || !end) return null;
  const first = WEEK.indexOf(start);
  const last = WEEK.indexOf(end);
  return last >= first
    ? WEEK.slice(first, last + 1)
    : [...WEEK.slice(first), ...WEEK.slice(0, last + 1)];
};

const clock = (value: string) => {
  const [hours = "", minutes = "00"] = value.split(":");
  const hour = Number(hours);
  const minute = Number(minutes);
  if (hour > 24 || minute > 59 || (hour === 24 && minute > 0)) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

const parseSegment = (segment: string): OpeningRule | "closed" | null => {
  const closed = CLOSED_SEGMENT.exec(segment);
  if (closed) return dayRange(closed[1] ?? "", closed[2]) ? "closed" : null;
  const match = OPEN_SEGMENT.exec(segment);
  if (!match) return null;
  const [, from = "", to, start = "", end = ""] = match;
  const days = dayRange(from, to);
  const opens = clock(start);
  const closes = clock(end);
  return days && opens && closes ? { days, opens, closes } : null;
};

export const parseOpeningHours = (text: string): OpeningRule[] | null => {
  const segments = normalize(text)
    .split(SEGMENT_SEPARATOR)
    .map((segment) => segment.trim())
    .filter(Boolean);
  const rules: OpeningRule[] = [];
  for (const segment of segments) {
    const rule = parseSegment(segment);
    if (rule === null) return null;
    if (rule !== "closed") rules.push(rule);
  }
  return rules.length > 0 ? rules : null;
};
