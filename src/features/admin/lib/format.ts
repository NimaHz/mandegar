import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";

export const faNumber = (value: number) => formatNumber("fa", value);

const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export const formatBytes = (bytes: number) => {
  const index = Math.min(
    UNITS.length - 1,
    Math.max(0, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024))),
  );
  const value = bytes / 1024 ** index;
  return formatNumber("fa", value, {
    style: "unit",
    unit: UNITS[index],
    unitDisplay: "long",
    maximumFractionDigits: index === 0 ? 0 : 1,
  });
};

export const formatClock = (totalSec: number) => {
  const safe = Math.max(0, Math.round(totalSec));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const parseClock = (value: string) => {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(value.trim());
  return match ? Number(match[1]) * 60 + Number(match[2]) : null;
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
