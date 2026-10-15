"use client";

import type { LucideIcon } from "lucide-react";
import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/cn";

interface FieldShellProps {
  id: string;
  label: string;
  hideLabel?: boolean;
  error?: string | undefined;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
}

const messageId = (id: string) => `${id}-message`;

function FieldShell({ id, label, hideLabel, error, hint, className, children }: FieldShellProps) {
  const message = error ?? hint;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className={cn("text-label font-bold text-ink", hideLabel && "sr-only")}>
        {label}
      </label>
      {children}
      {message && (
        <p
          id={messageId(id)}
          className={cn("text-xs", error ? "font-semibold text-danger" : "text-muted")}
        >
          {message}
        </p>
      )}
    </div>
  );
}

const controlClass = (hasError: boolean) =>
  cn(
    "w-full rounded-field border bg-raised text-lead text-ink transition-[border-color,box-shadow] duration-200 outline-none focus:border-primary focus:ring-3 focus:ring-primary/15",
    hasError ? "border-danger" : "border-line-strong",
  );

interface FieldProps extends ComponentProps<"input"> {
  label: string;
  hideLabel?: boolean;
  icon?: LucideIcon;
  error?: string | undefined;
  hint?: ReactNode;
  wrapperClassName?: string;
}

export function Field({
  label,
  hideLabel,
  icon: Icon,
  error,
  hint,
  id,
  className,
  wrapperClassName,
  ...props
}: FieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      hideLabel={hideLabel}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute start-3.5 top-1/2 size-4.5 -translate-y-1/2 text-muted"
            aria-hidden
          />
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={(error ?? hint) ? messageId(inputId) : undefined}
          className={cn(
            controlClass(Boolean(error)),
            "h-12",
            Icon ? "ps-10 pe-3.5" : "px-3.5",
            className,
          )}
          {...props}
        />
      </div>
    </FieldShell>
  );
}

interface TextAreaFieldProps extends ComponentProps<"textarea"> {
  label: string;
  hideLabel?: boolean;
  error?: string | undefined;
  hint?: ReactNode;
  wrapperClassName?: string;
}

export function TextAreaField({
  label,
  hideLabel,
  error,
  hint,
  id,
  className,
  wrapperClassName,
  ...props
}: TextAreaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <FieldShell
      id={inputId}
      label={label}
      hideLabel={hideLabel}
      error={error}
      hint={hint}
      className={wrapperClassName}
    >
      <textarea
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={(error ?? hint) ? messageId(inputId) : undefined}
        className={cn(
          controlClass(Boolean(error)),
          "min-h-28 resize-y px-3.5 py-3 leading-7",
          className,
        )}
        {...props}
      />
    </FieldShell>
  );
}
