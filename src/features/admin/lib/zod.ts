import type { z } from "zod";

import { fill } from "@/i18n/fill";

import { adminContent } from "../content";
import { faNumber } from "./format";

const copy = adminContent.validation;

const amount = (value: number | bigint) => faNumber(Number(value));

const sizeMessage = (issue: z.core.$ZodRawIssue) => {
  if (issue.code === "too_small") {
    const min = amount(issue.minimum);
    if (issue.origin === "string")
      return Number(issue.minimum) <= 1 ? copy.required : fill(copy.tooShort, { min });
    if (issue.origin === "array" || issue.origin === "set") return fill(copy.tooFew, { min });
    return fill(copy.tooSmall, { min });
  }
  if (issue.code === "too_big") {
    const max = amount(issue.maximum);
    if (issue.origin === "string") return fill(copy.tooLong, { max });
    if (issue.origin === "array" || issue.origin === "set") return fill(copy.tooMany, { max });
    return fill(copy.tooBig, { max });
  }
  return undefined;
};

const formatMessage = (format: string) => {
  if (format === "email") return copy.email;
  if (format === "url") return copy.url;
  if (format === "regex") return copy.invalid;
  if (format === "date" || format === "datetime") return copy.date;
  return copy.invalid;
};

const adminErrorMap: z.core.$ZodErrorMap = (issue) => {
  if (issue.code === "too_small" || issue.code === "too_big") return sizeMessage(issue);
  if (issue.code === "invalid_format") return formatMessage(issue.format);
  if (issue.code === "invalid_value") return copy.choice;
  if (issue.code === "invalid_type") {
    if (issue.input === undefined || issue.input === null || issue.input === "")
      return copy.required;
    if (issue.expected === "number") return copy.number;
    if (issue.expected === "int") return copy.integer;
    return copy.invalid;
  }
  if (issue.code === "not_multiple_of") return copy.integer;
  return copy.invalid;
};

export const zodOptions = { error: adminErrorMap } as const;
