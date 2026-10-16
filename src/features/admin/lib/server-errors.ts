import type { FieldPath, FieldValues, UseFormSetError } from "react-hook-form";

import { adminContent } from "../content";
import type { AdminApiError } from "./api-error";

const { validation } = adminContent;

export const fieldMessage = (message: string) => {
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
  if (/unknown province/i.test(message)) return validation.choice;
  if (/invalid link/i.test(message)) return validation.link;
  if (/may appear once/i.test(message)) return validation.duplicate;
  if (/cannot be its own parent/i.test(message)) return validation.ownParent;
  if (/one level of nesting/i.test(message)) return validation.nesting;
  if (/with children cannot become a child/i.test(message)) return validation.hasChildren;
  if (/active support user/i.test(message)) return validation.assignee;
  if (/demote or deactivate yourself/i.test(message)) return validation.selfDemote;
  if (/active owner is required/i.test(message)) return validation.lastOwner;
  if (/own password from the account page/i.test(message)) return validation.ownPassword;
  return validation.invalid;
};

export const firstFieldMessage = ({ fields }: AdminApiError) =>
  Object.values(fields)
    .map(fieldMessage)
    .find((message) => message !== validation.invalid);

export const applyFieldErrors = <TValues extends FieldValues>(
  setError: UseFormSetError<TValues>,
  error: AdminApiError,
) =>
  Object.entries(error.fields).forEach(([path, message]) =>
    setError(path as FieldPath<TValues>, { message: fieldMessage(message) }, { shouldFocus: true }),
  );
