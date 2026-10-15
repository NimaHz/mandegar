import { type Locale, localeMeta } from "@/i18n/config";

export const formatNumber = (locale: Locale, value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(localeMeta[locale].intl, options).format(value);
