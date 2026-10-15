"use client";

import { ArrowLeft, LoaderCircle, LockKeyhole, ScanLine } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState, useTransition } from "react";

import {
  CodeInput,
  type CodeInputMessages,
  type CodeIssue,
  inspectCode,
} from "@/components/shared/code-input";
import { Button } from "@/components/ui/button";
import { formatWarrantyCode } from "@/lib/warranty-code";

interface WarrantyFormCopy {
  submit: string;
  pending: string;
  trust: string;
  scanHint: string;
}

interface WarrantyFormProps {
  action: Route;
  defaultCode: string;
  serverIssue: CodeIssue | null;
  messages: CodeInputMessages;
  copy: WarrantyFormCopy;
}

export function WarrantyForm({
  action,
  defaultCode,
  serverIssue,
  messages,
  copy,
}: WarrantyFormProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [reveal, setReveal] = useState(serverIssue !== null);
  const [issue, setIssue] = useState(serverIssue);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const inspection = inspectCode("warranty", inputRef.current?.value ?? "");
    setReveal(true);
    if (!inspection.valid) {
      inputRef.current?.focus();
      return;
    }
    const href = `${action}?code=${formatWarrantyCode(inspection.code)}` as Route;
    startTransition(() => router.push(href, { scroll: false }));
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
