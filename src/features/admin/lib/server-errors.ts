import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import { adminContent } from "../content";
import type { AdminApiError } from "./api-error";

const { validation } = adminContent;

const fieldMessage = (message: string) => {
  if (/already in use/i.test(message)) return validation.taken;
  if (/referenced item not found/i.test(message)) return validation.missingRef;
  return validation.invalid;
};

export const applyFieldErrors = <TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  error: AdminApiError,
) =>
  Object.entries(error.fields).forEach(([path, message]) =>
    setError(path as FieldPath<TValues>, { message: fieldMessage(message) }, { shouldFocus: true }),
  );
