import { type Locale, localeMeta } from "@/i18n/config";
import { listFormat, numberFormat } from "@/lib/intl";

export const MB = 1024 * 1024;

const BYTE_UNITS = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export const formatNumber = (locale: Locale, value: number, options?: Intl.NumberFormatOptions) =>
  numberFormat(localeMeta[locale].intl, options).format(value);

export const formatList = (locale: Locale, items: string[]) =>
  listFormat(localeMeta[locale].intl, { style: "narrow" }).format(items);

export const formatBytes = (locale: Locale, bytes: number) => {
  const last = BYTE_UNITS.length - 1;
  const scale = (unit: number) => (unit === 0 ? 1 : 10);
  const estimate = Math.min(
    last,
    Math.max(0, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024))),
  );
  const roundsUp =
    Math.round((bytes / 1024 ** estimate) * scale(estimate)) >= 1024 * scale(estimate);
  const index = estimate < last && roundsUp ? estimate + 1 : estimate;
  return formatNumber(locale, bytes / 1024 ** index, {
    style: "unit",
    unit: BYTE_UNITS[index],
    unitDisplay: "long",
    maximumFractionDigits: index === 0 ? 0 : 1,
  });
};

export const durationMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));

export const formatClock = (locale: Locale, totalSeconds: number) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => formatNumber(locale, value, { minimumIntegerDigits: 2 });
  return hours > 0
    ? `${formatNumber(locale, hours)}:${pad(minutes)}:${pad(seconds)}`
    : `${formatNumber(locale, minutes)}:${pad(seconds)}`;
};
