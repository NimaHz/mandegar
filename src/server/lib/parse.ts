import type { z } from "zod";

import { ValidationFailure } from "./http-error";

export const issuesToFields = (issues: readonly z.core.$ZodIssue[]) => {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.map(String).join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
};

export const parseOrThrow = <TSchema extends z.ZodType>(
  schema: TSchema,
  value: unknown,
): z.output<TSchema> => {
  const result = schema.safeParse(value);
  if (!result.success) throw new ValidationFailure(issuesToFields(result.error.issues));
  return result.data;
};
