import { z } from "zod";

import { todayIsoDate } from "@/lib/dates";
import { normalizeMobile } from "@/lib/persian";
import { isProvinceCode } from "@/lib/provinces";
import { parseWarrantyCode } from "@/lib/warranty-code";
import { type TicketFieldsInput, ticketFieldsSchema } from "@/server/modules/tickets/schema";
import { type TicketType, ticketTypes } from "@/types/support";

import { type RequestStep, requestSteps } from "./constants";

export interface RequestValues {
  type: TicketType | "";
  warrantyCode: string;
  productSlug: string;
  purchaseDate: string;
  subject: string;
  description: string;
  name: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  address: string;
}

export type RequestField = keyof RequestValues;

export const emptyRequest: RequestValues = {
  type: "",
  warrantyCode: "",
  productSlug: "",
  purchaseDate: "",
  subject: "",
  description: "",
  name: "",
  phone: "",
  email: "",
  province: "",
  city: "",
  address: "",
};

export const stepFields: Record<RequestStep, RequestField[]> = {
  type: ["type"],
  product: ["warrantyCode", "productSlug", "purchaseDate"],
  details: ["subject", "description"],
  contact: ["name", "phone", "email", "province", "city", "address"],
  review: [],
};

export const isRequestField = (value: unknown): value is RequestField =>
  typeof value === "string" && value in emptyRequest;

export const stepOfField = (field: RequestField) =>
  requestSteps.find((step) => stepFields[step].includes(field)) ?? "review";

export interface RequestMessages {
  type: string;
  productNeeded: string;
  warrantyCode: string;
  purchaseDate: string;
  subject: string;
  subjectLong: string;
  description: string;
  descriptionLong: string;
  name: string;
  phone: string;
  email: string;
  province: string;
  city: string;
  address: string;
}

const PRODUCT_TYPES: readonly string[] = ["warranty-repair", "repair", "spare-parts"];

const needsProduct = (type: string) => PRODUCT_TYPES.includes(type);

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const isPastIsoDate = (value: string) =>
  ISO_DATE.test(value) && !Number.isNaN(Date.parse(value)) && value <= todayIsoDate();

const text = (min: number, max: number, short: string, long = short) =>
  z.string().trim().min(min, short).max(max, long);

export const createStepSchemas = (messages: RequestMessages) => ({
  type: z.looseObject({
    type: z.enum(ticketTypes, { error: messages.type }),
  }),
  product: z
    .looseObject({
      type: z.string(),
      warrantyCode: z
        .string()
        .refine((value) => !value || parseWarrantyCode(value).valid, messages.warrantyCode),
      productSlug: z.string(),
      purchaseDate: z
        .string()
        .refine((value) => !value || isPastIsoDate(value), messages.purchaseDate),
    })
    .superRefine((values, context) => {
      if (needsProduct(values.type) && !values.warrantyCode && !values.productSlug) {
        context.addIssue({
          code: "custom",
          path: ["productSlug"],
          message: messages.productNeeded,
        });
      }
    }),
  details: z.looseObject({
    subject: text(3, 120, messages.subject, messages.subjectLong),
    description: text(10, 3000, messages.description, messages.descriptionLong),
  }),
  contact: z.looseObject({
    name: text(2, 80, messages.name),
    phone: z.string().refine((value) => normalizeMobile(value) !== null, messages.phone),
    email: z
      .string()
      .trim()
      .refine((value) => !value || z.email().max(120).safeParse(value).success, messages.email),
    province: z.string().refine(isProvinceCode, messages.province),
    city: text(2, 60, messages.city),
    address: text(5, 300, messages.address),
  }),
  review: z.looseObject({}),
});

export const toTicketFields = (values: RequestValues): TicketFieldsInput => ({
  type: values.type === "" ? "technical" : values.type,
  name: values.name.trim(),
  phone: normalizeMobile(values.phone) ?? values.phone,
  email: values.email.trim(),
  province: values.province,
  city: values.city.trim(),
  address: values.address.trim(),
  warrantyCode: values.warrantyCode,
  productSlug: values.productSlug,
  purchaseDate: values.purchaseDate,
  subject: values.subject.trim(),
  description: values.description.trim(),
});

export const isTicketPayloadValid = (values: RequestValues) =>
  values.type !== "" && ticketFieldsSchema.safeParse(toTicketFields(values)).success;
