"use client";

import { get, useFormState } from "react-hook-form";

export function useFieldError(name: string) {
  const { errors } = useFormState({ name });
  const error: unknown = get(errors, name);
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string")
    return error.message || undefined;
  return undefined;
}
