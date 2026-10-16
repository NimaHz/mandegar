"use client";

import { useRef } from "react";
import {
  type DefaultValues,
  type FieldPath,
  type FieldValues,
  useForm,
  type UseFormProps,
  useFormState,
} from "react-hook-form";

import { isRecord } from "@/lib/guards";

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  isRecord(value) && !Array.isArray(value);

type EditorFormProps<TInput extends FieldValues, TOutput extends FieldValues> = Omit<
  UseFormProps<TInput, unknown, TOutput>,
  "defaultValues"
> & { defaultValues: TInput };

export function useEditorForm<TInput extends FieldValues, TOutput extends FieldValues>(
  props: EditorFormProps<TInput, TOutput>,
) {
  const form = useForm<TInput, unknown, TOutput>({
    ...props,
    defaultValues: props.defaultValues as DefaultValues<TInput>,
  });
  const { isDirty, isSubmitting } = useFormState({ control: form.control });
  const saved = useRef<TInput>(props.defaultValues);

  const capture = () => structuredClone(form.getValues());

  const commit = (sent: TInput, stored: TInput = sent) => {
    form.resetDefaultValues(sent);
    const untouched = Object.entries(stored).filter(
      ([key]) => !form.getFieldState(key as FieldPath<TInput>).isDirty,
    );
    form.resetDefaultValues(stored);
    for (const [key, value] of untouched) {
      const name = key as FieldPath<TInput>;
      if (form.getFieldState(name).isDirty) form.setValue(name, value);
    }
    saved.current = stored;
    form.resetDefaultValues(stored);
  };

  const discard = () => form.reset(saved.current);

  const keepEdits = (
    latest: Record<string, unknown>,
    current: Record<string, unknown>,
    prefix = "",
  ): Record<string, unknown> =>
    Object.fromEntries(
      Object.keys({ ...latest, ...current }).map((key) => {
        const path = `${prefix}${key}`;
        const [theirs, ours] = [latest[key], current[key]];
        if (!form.getFieldState(path as FieldPath<TInput>).isDirty) return [key, theirs];
        return [
          key,
          isPlainRecord(theirs) && isPlainRecord(ours) ? keepEdits(theirs, ours, `${path}.`) : ours,
        ];
      }),
    );

  const rebase = (latest: TInput) => {
    const current = capture();
    form.resetDefaultValues(saved.current);
    const merged = keepEdits(latest, current) as TInput;
    saved.current = latest;
    form.reset(merged);
    form.resetDefaultValues(latest);
  };

  return { form, isDirty, isSubmitting, capture, commit, discard, rebase };
}
