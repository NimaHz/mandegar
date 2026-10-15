"use client";

import { ArrowLeft, LoaderCircle, LockKeyhole, ScanLine } from "lucide-react";
import type { Route } from "next";
import { useQueryStates } from "nuqs";
import { type FormEvent, Suspense, useRef, useState } from "react";

import {
  CodeInput,
  type CodeInputMessages,
  type CodeIssue,
  inspectCode,
} from "@/components/shared/code-input";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/i18n/locale-provider";
import { formatWarrantyCode, parseWarrantyCode } from "@/lib/warranty-code";

import { useWarrantyLookupStore } from "../lookup-store";
import { warrantySearchParams } from "../search-params";

interface WarrantyFormCopy {
  submit: string;
  pending: string;
  trust: string;
  scanHint: string;
}

interface WarrantyFormProps {
  action: Route;
  messages: CodeInputMessages;
  copy: WarrantyFormCopy;
}

interface CodeFormProps extends WarrantyFormProps {
  defaultCode: string;
  onCode?: (code: string) => void;
}

const issueOf = (code: string): CodeIssue | null => {
  if (!code) return null;
  const parsed = parseWarrantyCode(code);
  return parsed.valid ? null : parsed.reason;
};

function CodeForm({ action, defaultCode, onCode, messages, copy }: CodeFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const pending = useWarrantyLookupStore((state) => state.loading);
  const [reveal, setReveal] = useState(issueOf(defaultCode) !== null);
  const [issue, setIssue] = useState(() => issueOf(defaultCode));

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!onCode) return;
    event.preventDefault();
    const inspection = inspectCode("warranty", inputRef.current?.value ?? "");
    setReveal(true);
    if (!inspection.valid) {
      inputRef.current?.focus();
      return;
    }
    onCode(inspection.code);
  };

  return (
    <form
      method="get"
      action={action}
      noValidate
      onSubmit={onSubmit}
      aria-busy={pending}
      className="flex w-full max-w-xl flex-col gap-4 panel bg-raised p-5 text-start shadow-lift sm:p-7"
    >
      <CodeInput
        ref={inputRef}
        kind="warranty"
        name="code"
        messages={messages}
        defaultValue={defaultCode}
        reveal={reveal}
        error={issue ? messages.issues[issue] : undefined}
        onValueChange={() => {
          setIssue(null);
          setReveal(false);
        }}
      />
      <Button type="submit" size="lg" block disabled={pending} className="group shadow-primary">
        {pending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
            {copy.pending}
          </>
        ) : (
          <>
            {copy.submit}
            <ArrowLeft
              className="size-5 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
              aria-hidden
            />
          </>
        )}
      </Button>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-caption text-muted">
        <span className="inline-flex items-center gap-1.5">
          <LockKeyhole className="size-3.5 text-subtle" aria-hidden />
          {copy.trust}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <ScanLine className="size-3.5 text-subtle" aria-hidden />
          {copy.scanHint}
        </span>
      </div>
    </form>
  );
}

function QueryCodeForm(props: WarrantyFormProps) {
  const locale = useLocale();
  const check = useWarrantyLookupStore((state) => state.check);
  const [{ code }, setParams] = useQueryStates(warrantySearchParams, {
    history: "push",
    scroll: false,
  });

  const submitCode = (next: string) => {
    void setParams({ code: formatWarrantyCode(next) });
    void check(locale, next, true);
  };

  return <CodeForm key={code} {...props} defaultCode={code} onCode={submitCode} />;
}

export function WarrantyForm(props: WarrantyFormProps) {
  return (
    <Suspense fallback={<CodeForm {...props} defaultCode="" />}>
      <QueryCodeForm {...props} />
    </Suspense>
  );
}
