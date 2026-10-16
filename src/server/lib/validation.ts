import { z } from "zod";

import { defaultLocale, locales } from "@/i18n/config";
import { normalizeMobile, toLatinDigits } from "@/lib/persian";
import { isProvinceCode } from "@/lib/provinces";

import { MAX_PAGE } from "./pagination";

const requiredText = (max: number) => z.string().trim().min(1).max(max);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== "object" || value === null) return false;
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
};

const withoutNulBytes = (value: string) => value.replaceAll("\u0000", "");

export const stripNulBytes = (value: unknown): unknown => {
  if (typeof value === "string") return withoutNulBytes(value);
  if (Array.isArray(value)) {
    const entries: unknown[] = value;
    entries.forEach((entry, index) => {
      entries[index] = stripNulBytes(entry);
    });
  } else if (isPlainObject(value)) {
    for (const [key, entry] of Object.entries(value)) value[key] = stripNulBytes(entry);
  }
  return value;
};

export const localizedText = (max = 200) =>
  z.object({ fa: requiredText(max), en: requiredText(max) });

export const optionalLocalizedText = (max = 200) =>
  z.object({ fa: z.string().trim().max(max), en: z.string().trim().max(max) });

export const localizedSeoSchema = z
  .object({ title: optionalLocalizedText(80), description: optionalLocalizedText(200) })
  .nullable();

export const slugSchema = z
  .string()
  .trim()
  .overwrite(toLatinDigits)
  .toLowerCase()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const idSchema = z.uuid();

export const idParamsSchema = z.object({ id: z.uuid() });

export const mobileSchema = z
  .string()
  .trim()
  .max(20)
  .transform((value, context) => {
    const mobile = normalizeMobile(value);
    if (!mobile) {
      context.addIssue({ code: "custom", message: "Invalid mobile number" });
      return z.NEVER;
    }
    return mobile;
  });

export const provinceSchema = z.string().trim().refine(isProvinceCode, "Unknown province");

export const urlOrPathSchema = z
  .string()
  .trim()
  .max(500)
  .refine((value) => /^\/(?![/\\])/.test(value) || /^https:\/\//.test(value), "Invalid link");

export const iconSchema = z
  .string()
  .trim()
  .max(60)
  .regex(/^[a-z0-9-]+$/);

export const listQuerySchema = z.object({
  q: z.string().overwrite(withoutNulBytes).trim().max(100).catch(""),
  page: z.coerce.number().int().min(1).max(MAX_PAGE).catch(1),
});

export const optionalFilter = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.preprocess((value) => (value === "" ? undefined : value), schema.optional()).catch(undefined);

export const sortSchema = <const TValues extends readonly [string, ...string[]]>(values: TValues) =>
  optionalFilter(z.enum(values));

export const localeSchema = z.enum(locales).catch(defaultLocale);

export const optionalText = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.preprocess((value) => (value === "" || value === null ? undefined : value), schema.optional());

export const expectedUpdatedAtSchema = z.iso.datetime({ offset: true }).optional();

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email().max(120));

export const phoneNumberSchema = z
  .string()
  .trim()
  .overwrite(toLatinDigits)
  .min(4)
  .max(30)
  .regex(/^[+\d][\d\s-]*$/);
