"use client";

import { LoaderCircle, Search, ShieldCheck } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { CodeInput, inspectCode } from "@/components/shared/code-input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import type { Locale } from "@/i18n/config";
import { apiClient, apiResult } from "@/lib/api-client";
import { normalizeMobile } from "@/lib/persian";
import type { PublicTicket } from "@/types/support";

import type { TrackContent } from "../../content";

interface TrackFormProps {
  locale: Locale;
  copy: TrackContent["form"];
  phonePlaceholder: string;
  onFound: (ticket: PublicTicket, input: { trackingCode: string; phone: string }) => void;
}

export function TrackForm({ locale, copy, phonePlaceholder, onFound }: TrackFormProps) {
  const codeRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const [reveal, setReveal] = useState(false);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReveal(true);
    setFormError(null);
    const code = inspectCode("tracking", codeRef.current?.value ?? "");
    const phone = normalizeMobile(phoneRef.current?.value ?? "");
    setPhoneError(phone ? undefined : copy.phoneError);
    if (!code.valid) {
      codeRef.current?.focus();
      return;
    }
    if (!phone) {
      phoneRef.current?.focus();
      return;
    }
    setPending(true);
    const input = { trackingCode: code.code, phone };
    const result = await apiResult(apiClient.api.tickets.track.post({ ...input, locale }));
    setPending(false);
    if (result.ok) {
      onFound(result.data, input);
      return;
    }
    setFormError(
      result.code === "NOT_FOUND"
        ? copy.notFound
        : result.code === "RATE_LIMITED"
          ? copy.rateLimited
          : copy.generic,
    );
  };

  return (
    <form
      noValidate
      onSubmit={(event) => void onSubmit(event)}
      aria-busy={pending}
      className="mx-auto flex w-full max-w-xl flex-col gap-5 panel bg-raised p-5 text-start shadow-lift sm:p-7"
    >
      <CodeInput
        ref={codeRef}
        kind="tracking"
        name="trackingCode"
        messages={copy.code}
        reveal={reveal}
        onValueChange={() => setReveal(false)}
      />
      <Field
        ref={phoneRef}
        label={copy.phone}
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel-national"
        placeholder={phonePlaceholder}
        maxLength={20}
        hint={copy.phoneHint}
        error={phoneError}
        onChange={() => setPhoneError(undefined)}
        className={locale === "fa" ? "text-end" : undefined}
      />
      {formError && (
        <p
          role="alert"
          className="rounded-field bg-danger-soft/70 p-3 text-sm leading-7 font-semibold text-danger"
        >
          {formError}
        </p>
      )}
      <Button type="submit" size="lg" block disabled={pending} className="shadow-primary">
        {pending ? (
          <>
            <LoaderCircle className="size-5 animate-spin" aria-hidden />
            {copy.pending}
          </>
        ) : (
          <>
            <Search className="size-5" aria-hidden />
            {copy.submit}
          </>
        )}
      </Button>
      <p className="inline-flex items-start gap-2 text-caption leading-5 text-muted">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-subtle" aria-hidden />
        {copy.privacy}
      </p>
    </form>
  );
}
