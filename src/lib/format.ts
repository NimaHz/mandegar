import { type Locale, localeMeta } from "@/i18n/config";

export const MB = 1024 * 1024;

const BYTE_UNITS = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

export const formatNumber = (locale: Locale, value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(localeMeta[locale].intl, options).format(value);

export const formatList = (locale: Locale, items: string[]) =>
  new Intl.ListFormat(localeMeta[locale].intl, { style: "narrow" }).format(items);

export const formatBytes = (locale: Locale, bytes: number) => {
  const index = Math.min(
    BYTE_UNITS.length - 1,
    Math.max(0, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024))),
  );
  return formatNumber(locale, bytes / 1024 ** index, {
    style: "unit",
    unit: BYTE_UNITS[index],
    unitDisplay: "long",
    maximumFractionDigits: index === 0 ? 0 : 1,
  });
};

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
