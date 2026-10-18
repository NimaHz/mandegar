import { type Locale, localeMeta } from "@/i18n/config";
import { dateTimeFormat } from "@/lib/intl";

const TIME_ZONE = "Asia/Tehran";

const calendarLocale = (locale: Locale) =>
  locale === "fa" ? `${localeMeta.fa.intl}-u-ca-persian` : localeMeta[locale].intl;

export const formatDate = (
  locale: Locale,
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
) =>
  dateTimeFormat(calendarLocale(locale), { timeZone: TIME_ZONE, ...options }).format(
    new Date(value),
  );

export const formatDateTime = (locale: Locale, value: string | Date) =>
  formatDate(locale, value, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const todayIsoDate = (date = new Date()) => {
  const parts = dateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
};

export const tehranMidnight = (isoDate: string) => new Date(`${isoDate}T00:00:00+03:30`);

export const startOfTehranDay = (date = new Date()) => tehranMidnight(todayIsoDate(date));

export const currentJalaliYear = (date = new Date()) =>
  Number(
    dateTimeFormat("en-u-ca-persian", { timeZone: TIME_ZONE, year: "numeric" })
      .formatToParts(date)
      .find((part) => part.type === "year")?.value ?? "1405",
  );

export const jalaliToGregorianYear = (jalaliYear: number) => jalaliYear + 621;

export const gregorianToJalaliYear = (gregorianYear: number) => gregorianYear - 621;
