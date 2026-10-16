import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import { adminContent } from "../content";
import type { AdminApiError } from "./api-error";

const { validation } = adminContent;

const fieldMessage = (message: string) => {
  if (/already in use/i.test(message)) return validation.taken;
  if (/referenced item not found/i.test(message)) return validation.missingRef;
  if (/distinct uploaded image/i.test(message)) return validation.distinct;
  if (/locked once codes are issued/i.test(message)) return validation.locked;
  if (/no policy matches/i.test(message)) return validation.noPolicy;
  if (/must be after the start/i.test(message)) return validation.endBeforeStart;
  if (/must start before the end/i.test(message)) return validation.afterDuration;
  if (/must be an image/i.test(message)) return validation.mediaImage;
  if (/must be a video/i.test(message)) return validation.mediaVideo;
  if (/must be a document/i.test(message)) return validation.mediaDocument;
  return validation.invalid;
};

export const applyFieldErrors = <TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  error: AdminApiError,
) =>
  Object.entries(error.fields).forEach(([path, message]) =>
    setError(path as FieldPath<TValues>, { message: fieldMessage(message) }, { shouldFocus: true }),
  );
