import { type Locale, localeMeta } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { formatNumber } from "@/lib/format";
import { pluralRules } from "@/lib/intl";

export interface PluralForms {
  one: string;
  other: string;
}

export const pluralForm = (locale: Locale, count: number, forms: PluralForms) =>
  pluralRules(localeMeta[locale].intl).select(count) === "one" ? forms.one : forms.other;

export const pluralize = (locale: Locale, count: number, forms: PluralForms) =>
  fill(pluralForm(locale, count, forms), { count: formatNumber(locale, count) });
