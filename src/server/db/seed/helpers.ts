import { createHash } from "node:crypto";

import { type SQL, sql } from "drizzle-orm";

import { formatNumber } from "@/lib/format";
import type { LocalizedSpecItem } from "@/types/admin";
import type { LocalizedText } from "@/types/common";

export const t = (fa: string, en: string): LocalizedText => ({ fa, en });

export const idsBySlug = (rows: readonly { id: string; slug: string }[]) =>
  new Map(rows.map((row) => [row.slug, row.id]));

export const seedId = (name: string) => {
  const hex = createHash("sha256").update(`mandegar-seed:${name}`).digest("hex");
  const variant = ((Number.parseInt(hex[16] ?? "0", 16) & 0x3) | 0x8).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-8${hex.slice(13, 16)}-${variant}${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

const toSnake = (key: string) => key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

export const fromExcluded = <TKey extends string>(keys: readonly TKey[]) =>
  Object.fromEntries(keys.map((key) => [key, sql.raw(`excluded."${toSnake(key)}"`)])) as Record<
    TKey,
    SQL
  >;

export const updatableKeys = <TRow extends object>(row: TRow, skip: readonly string[] = []) =>
  Object.keys(row).filter((key) => !["id", "createdAt", ...skip].includes(key));

export const amount = (value: number, options?: Intl.NumberFormatOptions) =>
  t(formatNumber("fa", value, options), formatNumber("en", value, options));

export const dimensions = (values: readonly number[]) =>
  t(
    values.map((value) => formatNumber("fa", value)).join(" × "),
    values.map((value) => formatNumber("en", value)).join(" × "),
  );

export interface Unit {
  label: LocalizedText;
  code: string | null;
}

export const units = {
  airflow: { label: t("متر مکعب بر ساعت", "m³/h"), code: "MQH" },
  watt: { label: t("وات", "W"), code: "WTT" },
  litre: { label: t("لیتر", "L"), code: "LTR" },
  litrePerMinute: { label: t("لیتر در دقیقه", "L/min"), code: "L2" },
  litrePerHour: { label: t("لیتر در ساعت", "L/h"), code: "E32" },
  centimetre: { label: t("سانتی‌متر", "cm"), code: "CMT" },
  millimetre: { label: t("میلی‌متر", "mm"), code: "MMT" },
  kilogram: { label: t("کیلوگرم", "kg"), code: "KGM" },
  decibel: { label: t("دسی‌بل", "dB"), code: "2N" },
  squareMetre: { label: t("متر مربع", "m²"), code: "MTK" },
  kcalPerHour: { label: t("کیلوکالری بر ساعت", "kcal/h"), code: null },
  gasFlow: { label: t("متر مکعب بر ساعت", "m³/h"), code: "MQH" },
  bar: { label: t("بار", "bar"), code: "BAR" },
  percent: { label: t("درصد", "%"), code: "P1" },
} satisfies Record<string, Unit>;

export const measure = (
  key: string,
  label: LocalizedText,
  value: number,
  unit: Unit | null,
  options?: Intl.NumberFormatOptions,
): LocalizedSpecItem => ({
  key,
  label,
  value: amount(value, options),
  numeric: value,
  unit: unit?.label ?? null,
  unitCode: unit?.code ?? null,
});

export const describe = (
  key: string,
  label: LocalizedText,
  value: LocalizedText,
): LocalizedSpecItem => ({
  key,
  label,
  value,
  numeric: null,
  unit: null,
  unitCode: null,
});
