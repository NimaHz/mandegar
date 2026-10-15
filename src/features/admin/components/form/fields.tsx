"use client";

import type { ComponentProps, ReactNode } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Field, TextAreaField } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/dates";
import { toLatinDigits } from "@/lib/persian";
import type { Option } from "@/types/common";

import { adminContent } from "../../content";
import { fromLocalInput } from "../../lib/datetime";
import { useFieldError } from "./use-field-error";

type InputProps = Omit<ComponentProps<typeof Field>, "name" | "error">;

export function TextInput({ name, ...props }: InputProps & { name: string }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return <Field error={error} {...props} {...register(name)} />;
}

export function CodeInput({ name, className, ...props }: InputProps & { name: string }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field
      dir="ltr"
      autoComplete="off"
      spellCheck={false}
      error={error}
      className={cn("text-start font-code", className)}
      {...props}
      {...register(name)}
    />
  );
}

const toNumber = (value: unknown) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const normalized = toLatinDigits(value).trim().replace(/[٫,]/g, ".");
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : Number.NaN;
};

export function NumberInput({ name, className, ...props }: InputProps & { name: string }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return (
    <Field
      inputMode="decimal"
      dir="ltr"
      autoComplete="off"
      error={error}
      className={cn("text-start tabular-nums", className)}
      {...props}
      {...register(name, { setValueAs: toNumber })}
    />
  );
}

type TextAreaProps = Omit<ComponentProps<typeof TextAreaField>, "name" | "error">;

export function TextArea({ name, ...props }: TextAreaProps & { name: string }) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  return <TextAreaField error={error} {...props} {...register(name)} />;
}

interface SelectInputProps extends Omit<ComponentProps<"select">, "name"> {
  name: string;
  label: string;
  options: readonly Option[];
  placeholder?: string;
  hint?: ReactNode;
  nullable?: boolean;
  optional?: boolean;
  hideLabel?: boolean;
}

export function SelectInput({
  name,
  label,
  options,
  placeholder,
  hint,
  nullable,
  optional,
  hideLabel,
  id,
  className,
  ...props
}: SelectInputProps) {
  const { register } = useFormContext();
  const error = useFieldError(name);
  const selectId = id ?? `field-${name}`;
  const messageId = `${selectId}-message`;
  const message = error ?? hint;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={selectId}
        className={cn("text-label font-bold text-ink", hideLabel && "sr-only")}
      >
        {label}
      </label>
      <Select
        id={selectId}
        options={options}
        placeholder={placeholder ?? (nullable ? adminContent.common.selectPlaceholder : undefined)}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? messageId : undefined}
        className={cn("h-12 rounded-field text-lead", error && "border-danger", className)}
        {...props}
        {...register(name, {
          setValueAs: (value: unknown) =>
            value === "" && (nullable || optional) ? (nullable ? null : undefined) : value,
        })}
      />
      {message && (
        <p
          id={messageId}
          className={cn("text-xs", error ? "font-semibold text-danger" : "text-muted")}
        >
          {message}
        </p>
      )}
    </div>
  );
}

interface SwitchInputProps {
  name: string;
  label: string;
  description?: string;
}

export function SwitchInput({ name, label, description }: SwitchInputProps) {
  const { control } = useFormContext();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Switch
          checked={Boolean(field.value)}
          onCheckedChange={field.onChange}
          label={label}
          description={description}
        />
      )}
    />
  );
}

function JalaliHint({ name, fallback }: { name: string; fallback?: string }) {
  const value: unknown = useWatch({ name });
  const iso = typeof value === "string" ? fromLocalInput(value) : null;
  return <span>{iso ? formatDateTime("fa", iso) : fallback}</span>;
}

export function DateTimeInput({
  name,
  label,
  hint,
}: {
  name: string;
  label: string;
  hint?: string;
}) {
  return (
    <TextInput
      name={name}
      type="datetime-local"
      dir="ltr"
      label={label}
      hint={<JalaliHint name={name} fallback={hint} />}
    />
  );
}
