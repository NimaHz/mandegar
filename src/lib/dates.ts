import { type Locale, localeMeta } from "@/i18n/config";

const TIME_ZONE = "Asia/Tehran";

const calendarLocale = (locale: Locale) =>
  locale === "fa" ? `${localeMeta.fa.intl}-u-ca-persian` : localeMeta[locale].intl;

export const formatDate = (
  locale: Locale,
  value: string | Date,
  options: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
) =>
  new Intl.DateTimeFormat(calendarLocale(locale), { timeZone: TIME_ZONE, ...options }).format(
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

export const currentJalaliYear = (date = new Date()) =>
  Number(
    new Intl.DateTimeFormat("en-u-ca-persian", { timeZone: TIME_ZONE, year: "numeric" })
      .formatToParts(date)
      .find((part) => part.type === "year")?.value ?? "1405",
  );

export const jalaliToGregorianYear = (jalaliYear: number) => jalaliYear + 621;
