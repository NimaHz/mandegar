"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, LoaderCircle, Mail, Send, Smartphone, Type, UserRound } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { SuccessMark } from "@/components/motion/success-mark";
import { AltchaWidget } from "@/components/shared/altcha-widget";
import { Button } from "@/components/ui/button";
import { CharCount } from "@/components/ui/char-count";
import { Field, TextAreaField } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { normalizeMobile } from "@/lib/persian";
import { type ContactDepartment, contactDepartments } from "@/types/support";

import type { ContactContent } from "../content";
import {
  contactBodyLimits,
  contactErrorMessage,
  type ContactField,
  type ContactFormOutput,
  type ContactFormValues,
  contactSchema,
  isContactField,
} from "../schemas";

interface ContactFormProps {
  content: ContactContent;
  defaultDepartment: ContactDepartment;
  className?: string;
}

interface ApiErrorBody {
  error?: { code?: string; fields?: Record<string, string> };
}

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.4, ease: EASE_OUT_EXPO },
};

const fetchFormToken = async () => {
  const { data } = await apiClient.api.tickets["form-token"].get();
  return data?.token ?? "";
};

export function ContactForm({ content, defaultDepartment, className }: ContactFormProps) {
  const departmentId = useId();
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState(false);
  const [formToken, setFormToken] = useState("");
  const [altcha, setAltcha] = useState<string | null>(null);
  const [altchaKey, setAltchaKey] = useState(0);
  const [altchaMissing, setAltchaMissing] = useState(false);

  const defaults: ContactFormValues = {
    department: defaultDepartment,
    name: "",
    phone: "",
    email: "",
    subject: "",
    body: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues, unknown, ContactFormOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: defaults,
  });

  useEffect(() => {
    let active = true;
    void fetchFormToken().then((token) => {
      if (active) setFormToken(token);
    });
    return () => {
      active = false;
    };
  }, []);

  const renewProof = () => {
    setAltcha(null);
    setAltchaKey((key) => key + 1);
    void fetchFormToken().then(setFormToken);
  };

  const errorFor = (field: ContactField) => {
    const error = errors[field];
    return error ? contactErrorMessage(content.errors, field, error.type) : undefined;
  };

  const onSubmit = async (values: ContactFormOutput) => {
    if (!altcha) {
      setAltchaMissing(true);
      return;
    }
    const { error } = await apiClient.api.contact.post({
      ...values,
      website: honeypotRef.current?.value ?? "",
      formToken: formToken || (await fetchFormToken()),
      altcha,
    });
    renewProof();

    if (!error) {
      setSent(true);
      reset(defaults);
      return;
    }

    const response = error.value as ApiErrorBody | undefined;
    const code = response?.error?.code;
    if (code === "VALIDATION") {
      for (const field of Object.keys(response?.error?.fields ?? {})) {
        if (isContactField(field)) setError(field, { type: "server" });
      }
      toast({ tone: "danger", title: content.toasts.invalid });
      return;
    }
    const title =
      code === "SPAM_REJECTED"
        ? content.toasts.expired
        : code === "CHALLENGE_FAILED"
          ? content.toasts.challenge
          : code === "RATE_LIMITED"
            ? content.toasts.rateLimited
            : content.toasts.failed;
    toast({
      tone: "danger",
      title,
      description: title === content.toasts.failed ? content.toasts.failedHint : undefined,
    });
  };

  const onPhoneBlur = (value: string) => {
    const normalized = normalizeMobile(value);
    if (normalized && normalized !== value) setValue("phone", normalized, { shouldValidate: true });
  };

  const messageValue = useWatch({ control, name: "body" });
  const phoneField = register("phone");
  const departmentError = errorFor("department");

  return (
    <div className={cn("panel p-5 shadow-card sm:p-8", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <m.div
            key="sent"
            role="status"
            {...fade}
            className="flex flex-col items-center gap-4 py-12 text-center"
          >
            <SuccessMark className="size-16" delay={0.1} />
            <h2
              ref={(node) => node?.focus()}
              tabIndex={-1}
              className="font-display text-2xl font-black text-ink outline-none"
            >
              {content.success.title}
            </h2>
            <p className="max-w-md text-sm leading-7 text-body">{content.success.body}</p>
            <Button variant="line" onClick={() => setSent(false)}>
              {content.success.again}
            </Button>
          </m.div>
        ) : (
          <m.form
            key="form"
            noValidate
            aria-labelledby="contact-form-title"
            onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            {...fade}
            className="relative grid grid-cols-1 gap-5 sm:grid-cols-2"
          >
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <h2
                id="contact-form-title"
                className="font-display text-xl font-black text-ink sm:text-2xl"
              >
                {content.formTitle}
              </h2>
              <p className="text-sm leading-7 text-body">{content.formDescription}</p>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor={departmentId} className="text-label font-bold text-ink">
                {content.fields.department}
              </label>
              <Select
                id={departmentId}
                options={contactDepartments.map((value) => ({
                  value,
                  label: content.departments[value],
                }))}
                aria-invalid={departmentError ? true : undefined}
                aria-describedby={departmentError ? `${departmentId}-message` : undefined}
                className="h-12 rounded-field text-lead"
                {...register("department")}
              />
              {departmentError && (
                <p id={`${departmentId}-message`} className="text-xs font-semibold text-danger">
                  {departmentError}
                </p>
              )}
            </div>

            <Field
              label={content.fields.name}
              icon={UserRound}
              autoComplete="name"
              error={errorFor("name")}
              {...register("name")}
            />
            <Field
              label={content.fields.phone}
              icon={Smartphone}
              type="tel"
              inputMode="tel"
              dir="ltr"
              autoComplete="tel"
              placeholder={content.fields.phonePlaceholder}
              error={errorFor("phone")}
              className="rtl:ps-3.5 rtl:pe-10 rtl:text-right"
              {...phoneField}
              onBlur={(event) => {
                void phoneField.onBlur(event);
                onPhoneBlur(event.target.value);
              }}
            />
            <Field
              label={content.fields.email}
              icon={AtSign}
              type="email"
              inputMode="email"
              dir="ltr"
              autoComplete="email"
              error={errorFor("email")}
              className="rtl:ps-3.5 rtl:pe-10 rtl:text-right"
              {...register("email")}
            />
            <Field
              label={content.fields.subject}
              icon={Type}
              error={errorFor("subject")}
              {...register("subject")}
            />
            <TextAreaField
              label={content.fields.message}
              rows={6}
              placeholder={content.fields.messagePlaceholder}
              wrapperClassName="sm:col-span-2"
              error={errorFor("body")}
              hint={<CharCount value={messageValue} limits={contactBodyLimits} />}
              {...register("body")}
            />

            <div
              aria-hidden
              className="pointer-events-none absolute top-0 size-px overflow-hidden opacity-0 [clip-path:inset(50%)]"
            >
              <label>
                {content.fields.website}
                <input
                  ref={honeypotRef}
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <AltchaWidget
                key={altchaKey}
                onChange={(payload) => {
                  setAltcha(payload);
                  if (payload) setAltchaMissing(false);
                }}
              />
              {altchaMissing && (
                <p role="alert" className="text-xs font-semibold text-danger">
                  {content.errors.altcha}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-4 border-t border-line pt-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-center gap-2 text-xs leading-6 text-muted">
                <Mail className="size-4 shrink-0" aria-hidden />
                {content.privacyNote}
              </p>
              <Button type="submit" size="lg" disabled={isSubmitting} className="min-w-44">
                {isSubmitting ? (
                  <LoaderCircle className="size-4.5 animate-spin" aria-hidden />
                ) : (
                  <Send className="size-4.5 rtl:-scale-x-100" aria-hidden />
                )}
                {isSubmitting ? content.submitting : content.submit}
              </Button>
            </div>
          </m.form>
        )}
      </AnimatePresence>
    </div>
  );
}
