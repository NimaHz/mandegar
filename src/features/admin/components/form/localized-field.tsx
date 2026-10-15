"use client";

import { useEffect, useEffectEvent, useId } from "react";
import { useFormContext, useWatch } from "react-hook-form";

import { cn } from "@/lib/cn";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import {
  type ContentLang,
  langMeta,
  type LangState,
  LangSwitch,
  useContentLang,
} from "./lang-scope";
import { MarkdownPreview } from "./markdown-preview";
import { useFieldError } from "./use-field-error";

interface LocalizedFieldProps {
  name: string;
  label: string;
  hint?: string;
  placeholder?: Partial<Record<ContentLang, string>>;
  maxLength?: number;
  multiline?: boolean;
  markdown?: boolean;
  rows?: number;
  className?: string;
}

const controlClass = (hasError: boolean) =>
  cn(
    "w-full rounded-field border bg-raised text-lead text-ink transition-[border-color,box-shadow] duration-200 outline-none focus:border-primary focus:ring-3 focus:ring-primary/15",
    hasError ? "border-danger" : "border-line-strong",
  );

const stateOf = (value: unknown, error: string | undefined): LangState =>
  error ? "error" : typeof value === "string" && value.trim() ? "filled" : "empty";

export function LocalizedField({
  name,
  label,
  hint,
  placeholder,
  maxLength,
  multiline,
  markdown,
  rows,
  className,
}: LocalizedFieldProps) {
  const id = useId();
  const { register } = useFormContext();
  const { lang, setLang } = useContentLang();
  const [fa, en] = useWatch({ name: [`${name}.fa`, `${name}.en`] });
  const errors = { fa: useFieldError(`${name}.fa`), en: useFieldError(`${name}.en`) };
  const values: Record<ContentLang, unknown> = { fa, en };
  const states = { fa: stateOf(fa, errors.fa), en: stateOf(en, errors.en) };
  const error = errors[lang];
  const messageId = `${id}-message`;
  const current = typeof values[lang] === "string" ? String(values[lang]) : "";
  const other: ContentLang = lang === "fa" ? "en" : "fa";

  const revealError = useEffectEvent(() => {
    if (errors[other] && !errors[lang]) setLang(other);
  });

  useEffect(() => {
    revealError();
  }, [errors.fa, errors.en]);

  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={`${id}-${lang}`} className="text-label font-bold text-ink">
          {label}
        </label>
        <LangSwitch value={lang} onChange={setLang} states={states} />
      </div>
      {(["fa", "en"] as const).map((option) => {
        const props = {
          id: `${id}-${option}`,
          dir: langMeta[option].dir,
          lang: option,
          placeholder: placeholder?.[option],
          "aria-invalid": errors[option] ? true : undefined,
          "aria-describedby": errors[option] || hint || maxLength ? messageId : undefined,
          hidden: option !== lang,
          ...register(`${name}.${option}`),
        };
        return multiline || markdown ? (
          <textarea
            key={option}
            rows={rows ?? (markdown ? 10 : 3)}
            className={cn(
              controlClass(Boolean(errors[option])),
              "min-h-24 resize-y px-3.5 py-3 leading-7",
              markdown && "min-h-56 font-sans text-sm leading-7",
            )}
            {...props}
          />
        ) : (
          <input
            key={option}
            className={cn(controlClass(Boolean(errors[option])), "h-12 px-3.5")}
            {...props}
          />
        );
      })}
      {markdown && <MarkdownPreview source={current} dir={langMeta[lang].dir} />}
      {(error || hint || maxLength) && (
        <p id={messageId} className="flex items-center justify-between gap-3 text-xs">
          <span className={error ? "font-semibold text-danger" : "text-muted"}>
            {error ?? hint}
          </span>
          {maxLength && (
            <span
              className={cn(
                "shrink-0 tabular-nums",
                current.length > maxLength ? "font-bold text-danger" : "text-muted",
              )}
            >
              {faNumber(current.length)}/{faNumber(maxLength)}
            </span>
          )}
        </p>
      )}
      {markdown && !error && (
        <p className="text-caption text-muted">{adminContent.common.markdownHint}</p>
      )}
    </div>
  );
}

export function LocalizedTextarea(props: Omit<LocalizedFieldProps, "multiline">) {
  return <LocalizedField multiline {...props} />;
}
