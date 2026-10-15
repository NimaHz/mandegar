import type { z } from "zod";

import { contactSchema } from "@/server/modules/contact/schema";

import type { ContactContent } from "./content";

export { contactSchema };

export type ContactFormValues = z.input<typeof contactSchema>;

export type ContactFormOutput = z.output<typeof contactSchema>;

export type ContactField = keyof ContactFormValues;

const contactFields = ["department", "name", "phone", "email", "subject", "body"] as const;

export const contactBodyLimits = { min: 10, max: 3000 } as const;

export const isContactField = (value: string): value is ContactField =>
  contactFields.some((field) => field === value);

export const contactErrorMessage = (
  errors: ContactContent["errors"],
  field: ContactField,
  type: string | undefined,
) => {
  const tooLong = type === "too_big";
  const messages: Record<ContactField, string> = {
    department: errors.department,
    name: tooLong ? errors.nameLong : errors.nameShort,
    phone: errors.phone,
    email: errors.email,
    subject: tooLong ? errors.subjectLong : errors.subjectShort,
    body: tooLong ? errors.messageLong : errors.messageShort,
  };
  return messages[field];
};
