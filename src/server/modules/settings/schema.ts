import { z } from "zod";

import { localizedText, optionalLocalizedText } from "@/server/lib/validation";

const socialUrl = z
  .url({ protocol: /^https$/ })
  .max(300)
  .nullable();

const labeledValue = z.object({
  label: localizedText(60),
  value: z.string().trim().min(1).max(120),
});

export const officeLocationSchema = z.object({
  lat: z.number().min(24).max(40),
  lng: z.number().min(44).max(64),
});

export const contactSettingsSchema = z.object({
  phones: z.array(labeledValue).max(10),
  emails: z.array(labeledValue).max(10),
  address: localizedText(300),
  hours: localizedText(200),
  socials: z.object({
    aparat: socialUrl,
    instagram: socialUrl,
    telegram: socialUrl,
    bale: socialUrl,
    eitaa: socialUrl,
    rubika: socialUrl,
    linkedin: socialUrl,
  }),
  location: officeLocationSchema.nullable().default(null),
});

export const seoSettingsSchema = z.object({
  defaultTitle: localizedText(80),
  defaultDescription: localizedText(200),
});

export const statsSettingsSchema = z.object({
  years: z.number().int().min(0).max(200),
  serviceCenters: z.number().int().min(0).max(100_000),
  models: z.number().int().min(0).max(100_000),
  warrantyMonths: z.number().int().min(0).max(240),
});

export const companySettingsSchema = z.object({
  legalName: optionalLocalizedText(200),
  nationalId: z.string().trim().max(20).nullable(),
  registrationNo: z.string().trim().max(20).nullable(),
  foundingYear: z.number().int().min(1300).max(2100).nullable(),
});

export const settingsSchemas = {
  contact: contactSettingsSchema,
  seo: seoSettingsSchema,
  stats: statsSettingsSchema,
  company: companySettingsSchema,
};
