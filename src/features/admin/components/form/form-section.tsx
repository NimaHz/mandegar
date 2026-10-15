"use client";

import { type ReactNode, useId } from "react";

import { faNumber } from "../../lib/format";
import { LangScope, LangSwitch } from "./lang-scope";

export const editorGridClass =
  "grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_19rem] xl:gap-6 2xl:grid-cols-[minmax(0,1fr)_22rem]";

export const editorAsideClass = "flex min-w-0 flex-col gap-4 lg:sticky lg:top-24";

export const fieldGridClass = "grid grid-cols-1 gap-4 sm:grid-cols-2";

interface FormSectionProps {
  step?: number;
  title: string;
  description?: string;
  localized?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export function FormSection({
  step,
  title,
  description,
  localized,
  action,
  children,
}: FormSectionProps) {
  const titleId = useId();
  const descriptionId = useId();

  const body = (
    <fieldset
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className="flex min-w-0 flex-col gap-4 card p-4 shadow-card sm:p-6"
    >
      <div className="flex flex-wrap items-start gap-3">
        {step !== undefined && (
          <span
            aria-hidden
            className="grid size-8 shrink-0 place-items-center rounded-control bg-inverse text-xs font-black text-on-inverse"
          >
            {faNumber(step)}
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h2 id={titleId} className="text-lead font-extrabold text-ink">
            {title}
          </h2>
          {description && (
            <p id={descriptionId} className="text-xs leading-6 text-muted">
              {description}
            </p>
          )}
        </div>
        {(localized || action) && (
          <div className="flex shrink-0 items-center gap-2">
            {action}
            {localized && <LangSwitch />}
          </div>
        )}
      </div>
      {children}
    </fieldset>
  );

  return localized ? <LangScope>{body}</LangScope> : body;
}
