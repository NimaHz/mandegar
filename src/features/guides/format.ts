import type { Locale } from "@/i18n/config";
import { formatNumber } from "@/lib/format";

export const durationMinutes = (seconds: number) => Math.max(1, Math.round(seconds / 60));

export const chapterClock = (locale: Locale, totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${formatNumber(locale, minutes)}:${formatNumber(locale, seconds, { minimumIntegerDigits: 2 })}`;
};
