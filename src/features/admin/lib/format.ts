import { fill } from "@/i18n/fill";
import { formatBytes, formatClock, formatNumber } from "@/lib/format";

export const faNumber = (value: number) => formatNumber("fa", value);

export const faBytes = (bytes: number) => formatBytes("fa", bytes);

export const CLOCK_PATTERN = /^(?:\d{1,2}:[0-5]\d|\d{1,3}):[0-5]\d$/;

export const clockValue = (totalSec: number) => formatClock("en", totalSec);

export const parseClock = (value: string) => {
  const clock = value.trim();
  if (!CLOCK_PATTERN.test(clock)) return null;
  return clock.split(":").reduce((total, part) => total * 60 + Number(part), 0);
};

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export const durationLabel = (ms: number, units: { minute: string; hour: string; day: string }) => {
  const abs = Math.abs(ms);
  if (abs >= DAY) return fill(units.day, { count: faNumber(Math.round(abs / DAY)) });
  if (abs >= HOUR) return fill(units.hour, { count: faNumber(Math.round(abs / HOUR)) });
  return fill(units.minute, { count: faNumber(Math.max(1, Math.round(abs / 60_000))) });
};

export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("‌");

export const faYear = (value: number) => formatNumber("fa", value, { useGrouping: false });
