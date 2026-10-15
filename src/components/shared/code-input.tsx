"use client";

import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";
import {
  type ChangeEvent,
  type ComponentProps,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { cn } from "@/lib/cn";
import { groupCode, hasValidCheck, normalizeCode } from "@/lib/codes";
import { formatNumber } from "@/lib/format";
import { TRACKING_CODE_LENGTH } from "@/lib/tracking-code";
import { SERIAL_CODE_LENGTH, WARRANTY_CODE_LENGTH } from "@/lib/warranty-code";

export type CodeKind = "warranty" | "tracking";

export type CodeIssue = "empty" | "length" | "prefix" | "check";

export interface CodeInspection {
  code: string;
  expected: number;
  valid: boolean;
  issue: CodeIssue | null;
  complete: boolean;
}

export interface CodeInputMessages {
  label: string;
  hint: string;
  placeholder: string;
  progress: string;
  valid: string;
  issues: Record<CodeIssue, string>;
}

const prefixes: Record<CodeKind, Record<string, number>> = {
  warranty: { W: WARRANTY_CODE_LENGTH, S: SERIAL_CODE_LENGTH },
  tracking: { T: TRACKING_CODE_LENGTH },
};

const defaultLength: Record<CodeKind, number> = {
  warranty: WARRANTY_CODE_LENGTH,
  tracking: TRACKING_CODE_LENGTH,
};

const maxLength = (kind: CodeKind) => Math.max(...Object.values(prefixes[kind]));

export const inspectCode = (kind: CodeKind, input: string): CodeInspection => {
  const code = normalizeCode(input).slice(0, maxLength(kind) + 1);
  const first = code[0];
  const expected = (first && prefixes[kind][first]) || defaultLength[kind];
  const base = { code, expected, valid: false, complete: code.length >= expected };
  if (!first) return { ...base, issue: "empty" };
  if (!prefixes[kind][first]) return { ...base, issue: "prefix" };
  if (code.length !== expected) return { ...base, issue: "length" };
  if (!hasValidCheck(code)) return { ...base, issue: "check" };
  return { ...base, valid: true, issue: null };
};

const formatCodeInput = (kind: CodeKind, code: string) =>
  groupCode(code, kind === "warranty" && code.startsWith("S") ? 4 : 3);

const caretIndex = (display: string, symbols: number) => {
  if (symbols <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < display.length; index += 1) {
    if (display[index] !== "-") seen += 1;
    if (seen === symbols) return index + 1;
  }
  return display.length;
};

type Tone = "idle" | "progress" | "valid" | "warning" | "danger";

const toneFor = (inspection: CodeInspection, reveal: boolean): Tone => {
  if (inspection.valid) return "valid";
  if (inspection.issue === "prefix") return "danger";
  if (inspection.issue === "check") return "warning";
  if (inspection.issue === "length" && (reveal || inspection.code.length > inspection.expected))
    return "danger";
  if (inspection.issue === "empty") return reveal ? "danger" : "idle";
  return "progress";
};

const segmentGroups = (expected: number, size: number) =>
  Array.from({ length: Math.ceil(expected / size) }, (_, group) =>
    Array.from(
      { length: Math.min(size, expected - group * size) },
      (_, offset) => group * size + offset,
    ),
  );

interface CodeInputProps extends Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "size" | "type"
> {
  kind: CodeKind;
  messages: CodeInputMessages;
  value?: string;
  defaultValue?: string;
  onValueChange?: (inspection: CodeInspection) => void;
  error?: string | undefined;
  reveal?: boolean;
  hideLabel?: boolean;
  size?: "md" | "lg";
  wrapperClassName?: string;
}

export function CodeInput({
  kind,
  messages,
  value,
  defaultValue = "",
  onValueChange,
  error,
  reveal = false,
  hideLabel = false,
  size = "lg",
  id,
  ref,
  className,
  wrapperClassName,
  onBlur,
  ...props
}: CodeInputProps) {
  const locale = useLocale();
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const inputRef = useRef<HTMLInputElement>(null);
  const caretRef = useRef<number | null>(null);
  const [inner, setInner] = useState(() => normalizeCode(defaultValue));
  const [blurred, setBlurred] = useState(false);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  const inspection = inspectCode(kind, value ?? inner);
  const display = formatCodeInput(kind, inspection.code);
  const tone = error ? "danger" : toneFor(inspection, reveal || blurred);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const target = caretRef.current;
    if (!input || target === null || document.activeElement !== input) return;
    const position = caretIndex(display, target);
    input.setSelectionRange(position, position);
    caretRef.current = null;
  }, [display]);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target;
    const caret = field.selectionStart ?? field.value.length;
    const next = inspectCode(kind, field.value);
    caretRef.current = Math.min(
      normalizeCode(field.value.slice(0, caret)).length,
      next.code.length,
    );
    setInner(next.code);
    if (next.code.length < inspection.code.length || next.code.length === 0) setBlurred(false);
    onValueChange?.(next);
  };

  const message =
    error ??
    (tone === "valid"
      ? messages.valid
      : tone === "danger" || tone === "warning"
        ? inspection.issue && messages.issues[inspection.issue]
        : messages.hint);

  const announce = tone === "valid" || tone === "warning" || tone === "danger" ? message : "";
  const StatusIcon =
    tone === "valid"
      ? CircleCheck
      : tone === "warning"
        ? TriangleAlert
        : tone === "danger"
          ? CircleAlert
          : null;
  const groups = segmentGroups(inspection.expected, inspection.expected === 12 ? 4 : 3);

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={inputId}
          className={cn("text-label font-bold text-ink", hideLabel && "sr-only")}
        >
          {messages.label}
        </label>
        <span aria-hidden className="text-caption font-semibold text-muted tabular-nums">
          {fill(messages.progress, {
            count: formatNumber(locale, Math.min(inspection.code.length, inspection.expected)),
            total: formatNumber(locale, inspection.expected),
          })}
        </span>
      </div>
      <div dir="ltr" className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          dir="ltr"
          value={display}
          onChange={onChange}
          onBlur={(event) => {
            if (inspection.code.length > 0) setBlurred(true);
            onBlur?.(event);
          }}
          inputMode="text"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder={messages.placeholder}
          aria-invalid={tone === "danger" || undefined}
          aria-describedby={messageId}
          className={cn(
            "w-full rounded-field border bg-raised ps-4 pe-12 font-code font-semibold tracking-[0.18em] text-ink uppercase shadow-field transition-[border-color,box-shadow] duration-200 outline-none placeholder:tracking-[0.18em] placeholder:text-subtle focus:ring-4",
            size === "lg" ? "h-15 text-xl sm:h-16 sm:text-2xl" : "h-12 text-lg",
            tone === "valid" && "border-success focus:ring-success/15",
            tone === "warning" && "border-warning focus:ring-warning/15",
            tone === "danger" && "border-danger focus:ring-danger/15",
            (tone === "idle" || tone === "progress") &&
              "border-line-strong focus:border-primary focus:ring-primary/15",
            className,
          )}
          {...props}
        />
        {StatusIcon && (
          <StatusIcon
            aria-hidden
            className={cn(
              "pointer-events-none absolute end-4 top-1/2 size-5.5 -translate-y-1/2",
              tone === "valid" && "text-success",
              tone === "warning" && "text-warning",
              tone === "danger" && "text-danger",
            )}
          />
        )}
      </div>
      <div dir="ltr" aria-hidden className="flex gap-2 px-1">
        {groups.map((group) => (
          <div key={group[0]} className="flex flex-1 gap-1">
            {group.map((index) => (
              <span
                key={index}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors duration-300",
                  index >= inspection.code.length
                    ? "bg-line"
                    : tone === "valid"
                      ? "bg-success"
                      : tone === "warning"
                        ? "bg-warning"
                        : tone === "danger"
                          ? "bg-danger"
                          : "bg-primary",
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <p
        id={messageId}
        className={cn(
          "text-xs leading-6",
          tone === "valid" && "font-semibold text-success",
          tone === "warning" && "font-semibold text-warning",
          tone === "danger" && "font-semibold text-danger",
          (tone === "idle" || tone === "progress") && "text-muted",
        )}
      >
        {message}
      </p>
      <span role="status" className="sr-only">
        {announce}
      </span>
    </div>
  );
}
