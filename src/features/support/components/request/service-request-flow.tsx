"use client";

import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  HardDriveDownload,
  LoaderCircle,
  RotateCcw,
  Send,
} from "lucide-react";
import { AnimatePresence, m, type Variants } from "motion/react";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import { Suspense, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import { EASE_OUT_EXPO } from "@/components/motion/easing";
import { useAltcha } from "@/components/shared/use-altcha";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsClient } from "@/hooks/use-is-client";
import { fill } from "@/i18n/fill";
import { useLocale } from "@/i18n/locale-provider";
import { localizePath } from "@/i18n/paths";
import { type ApiFailure, fetchFormToken, type FormToken, postMultipart } from "@/lib/api-client";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { parseWarrantyCode } from "@/lib/warranty-code";
import type { ModelOption } from "@/types/catalog";
import type { TicketReceipt, TicketType } from "@/types/support";

import { type RequestStep, requestSteps } from "../../constants";
import type { RequestFlowContent } from "../../content";
import { readDraft, readReceipt, writeDraft, writeReceipt } from "../../draft-storage";
import {
  createStepSchemas,
  emptyRequest,
  isRequestField,
  isTicketPayloadValid,
  type RequestField,
  type RequestMessages,
  type RequestValues,
  stepFields,
  stepOfField,
  toTicketFields,
} from "../../schemas";
import { requestSearchParams } from "../../search-params";
import { ContactStep } from "./contact-step";
import { DetailsStep } from "./details-step";
import { PreviousReceipt } from "./previous-receipt";
import { ProductStep } from "./product-step";
import { Receipt } from "./receipt";
import { ReviewStep } from "./review-step";
import { StepHeading } from "./step-heading";
import { StepIndicator } from "./step-indicator";
import { TypeStep } from "./type-step";

interface RequestPrefill {
  code: string;
  product: string;
}

interface ServiceRequestFlowProps {
  models: ModelOption[];
  copy: RequestFlowContent;
  types: Record<TicketType, { label: string; description: string }>;
}

const TOKEN_MIN_AGE_MS = 3_200;
const TOKEN_MAX_AGE_MS = 100 * 60 * 1000;

const fieldMessage: Record<RequestField, keyof RequestMessages> = {
  type: "type",
  warrantyCode: "warrantyCode",
  productSlug: "productNeeded",
  purchaseDate: "purchaseDate",
  subject: "subject",
  description: "description",
  name: "name",
  phone: "phone",
  email: "email",
  province: "province",
  city: "city",
  address: "address",
};

const stepVariants: Variants = {
  enter: ({ direction, sign }: { direction: number; sign: number }) => ({
    opacity: 0,
    x: direction * sign * 28,
  }),
  center: { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE_OUT_EXPO } },
  exit: ({ direction, sign }: { direction: number; sign: number }) => ({
    opacity: 0,
    x: direction * sign * -28,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

const withPrefill = (base: RequestValues, prefill: RequestPrefill): RequestValues => {
  const values = { ...base };
  if (prefill.code) {
    values.warrantyCode = prefill.code;
    if (!values.type) values.type = "warranty-repair";
  }
  if (prefill.product) values.productSlug = prefill.product;
  return values;
};

const initialState = (prefill: RequestPrefill) => {
  const draft = readDraft();
  return {
    values: withPrefill(draft?.values ?? emptyRequest, prefill),
    step: draft?.step ?? "type",
    furthest: draft?.furthest ?? 0,
  };
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const usePrefill = (models: ModelOption[]): RequestPrefill => {
  const [{ code, product }] = useQueryStates(requestSearchParams);
  const parsed = parseWarrantyCode(code);
  return {
    code: parsed.valid ? parsed.code : "",
    product: models.some((model) => model.slug === product) ? product : "",
  };
};

function RequestFlow({ models, copy, types }: ServiceRequestFlowProps) {
  const locale = useLocale();
  const prefill = usePrefill(models);
  const [initial] = useState(() => initialState(prefill));
  const prefilled = Boolean(prefill.code || prefill.product);
  const [receipt, setReceipt] = useState(() => (prefilled ? null : readReceipt()));
  const [previous, setPrevious] = useState(() => (prefilled ? readReceipt() : null));
  const [step, setStep] = useState<RequestStep>(initial.step);
  const [furthest, setFurthest] = useState(initial.furthest);
  const [direction, setDirection] = useState(1);
  const [interacted, setInteracted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [filesError, setFilesError] = useState<string | undefined>(undefined);
  const [submitError, setSubmitError] = useState<{ message: string; track?: boolean } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const tokenRef = useRef<FormToken | null>(null);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const altcha = useAltcha(receipt === null);
  const schemas = createStepSchemas(copy.errors);
  const form = useForm<RequestValues>({ defaultValues: initial.values });
  const index = requestSteps.indexOf(step);
  const typeLabels = Object.fromEntries(
    Object.entries(types).map(([type, entry]) => [type, entry.label]),
  );

  useEffect(() => {
    void fetchFormToken().then((token) => {
      tokenRef.current = token;
    });
  }, []);

  useEffect(() => {
    writeDraft({ values: form.getValues(), step, furthest });
    return form.subscribe({
      formState: { values: true },
      callback: ({ values }) => writeDraft({ values, step, furthest }),
    });
  }, [form, step, furthest]);

  const validate = (target: RequestStep, only?: RequestField) => {
    const result = schemas[target].safeParse(form.getValues());
    const fields = only ? [only] : stepFields[target];
    form.clearErrors(fields);
    if (result.success) return true;
    let valid = true;
    for (const issue of result.error.issues) {
      const field = issue.path[0];
      if (!isRequestField(field) || !fields.includes(field) || form.getFieldState(field).error)
        continue;
      form.setError(field, { type: "validate", message: issue.message });
      valid = false;
    }
    return valid;
  };

  useEffect(() =>
    form.subscribe({
      formState: { values: true },
      callback: ({ name }) => {
        if (!isRequestField(name)) return;
        const target = stepOfField(name);
        if (target === "product") {
          if (form.formState.errors.productSlug || form.getFieldState(name).error) {
            validate(target);
          }
          return;
        }
        if (form.getFieldState(name).error) validate(target, name);
      },
    }),
  );

  const focusFirstError = (target: RequestStep) => {
    const field = stepFields[target].find((name) => form.getFieldState(name).error);
    if (field) requestAnimationFrame(() => form.setFocus(field));
  };

  const goTo = (target: RequestStep) => {
    const to = requestSteps.indexOf(target);
    setDirection(to >= index ? 1 : -1);
    setInteracted(true);
    setStep(target);
    setFurthest((value) => Math.max(value, to));
    setSubmitError(null);
    const panel = panelRef.current;
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  const next = () => {
    if (!validate(step)) {
      focusFirstError(step);
      return;
    }
    const target = requestSteps[index + 1];
    if (target) goTo(target);
  };

  const ensureToken = async () => {
    let current = tokenRef.current;
    if (!current || Date.now() - current.issuedAt > TOKEN_MAX_AGE_MS) {
      current = await fetchFormToken();
      tokenRef.current = current;
    }
    if (!current) return "";
    const remaining = TOKEN_MIN_AGE_MS - (Date.now() - current.issuedAt);
    if (remaining > 0) await wait(remaining);
    return current.token;
  };

  const handleFailure = (failure: ApiFailure) => {
    const errors = copy.submitErrors;
    switch (failure.code) {
      case "VALIDATION": {
        let first: RequestStep | null = null;
        for (const key of Object.keys(failure.fields)) {
          const field = key.split(".")[0];
          const target =
            field === "attachments" ? "details" : isRequestField(field) ? stepOfField(field) : null;
          if (field === "attachments") setFilesError(errors.fileType);
          if (isRequestField(field)) {
            form.setError(field, { type: "server", message: copy.errors[fieldMessage[field]] });
          }
          if (target && (!first || requestSteps.indexOf(target) < requestSteps.indexOf(first))) {
            first = target;
          }
        }
        if (first) goTo(first);
        setSubmitError({ message: errors.validation });
        return;
      }
      case "SPAM_REJECTED":
        tokenRef.current = null;
        setSubmitError({ message: errors.expired });
        return;
      case "CHALLENGE_FAILED":
        setSubmitError({ message: errors.challenge });
        return;
      case "RATE_LIMITED":
        setSubmitError({ message: errors.rateLimited });
        return;
      case "LIMIT_REACHED":
        setSubmitError({ message: errors.limit, track: true });
        return;
      case "PAYLOAD_TOO_LARGE":
      case "UNSUPPORTED_MEDIA":
        setFilesError(failure.code === "PAYLOAD_TOO_LARGE" ? errors.tooLarge : errors.fileType);
        goTo("details");
        return;
      default:
        setSubmitError({ message: errors.generic });
    }
  };

  const submit = async () => {
    setSubmitError(null);
    for (const target of requestSteps) {
      if (validate(target)) continue;
      goTo(target);
      focusFirstError(target);
      return;
    }
    if (!isTicketPayloadValid(form.getValues())) {
      setSubmitError({ message: copy.submitErrors.validation });
      return;
    }
    const proof = altcha.payload;
    if (!proof) {
      setSubmitError({ message: copy.submitErrors.altchaPending });
      return;
    }
    setSubmitting(true);
    const data = new FormData();
    for (const [key, value] of Object.entries(toTicketFields(form.getValues()))) {
      if (typeof value === "string" && value) data.append(key, value);
    }
    data.append("website", honeypotRef.current?.value ?? "");
    data.append("formToken", await ensureToken());
    data.append("altcha", proof);
    data.append("locale", locale);
    for (const file of files) data.append("attachments", file);
    const result = await postMultipart<TicketReceipt>("/api/tickets", data);
    setSubmitting(false);
    altcha.renew();
    if (result.ok) {
      writeDraft(null);
      writeReceipt(result.data);
      setFiles([]);
      setPrevious(null);
      setReceipt(result.data);
      panelRef.current?.scrollIntoView({ block: "start" });
      return;
    }
    handleFailure(result);
  };

  const startOver = () => {
    form.reset(withPrefill(emptyRequest, prefill));
    setFiles([]);
    setFilesError(undefined);
    setFurthest(0);
    goTo("type");
  };

  const anotherRequest = () => {
    writeReceipt(null);
    setReceipt(null);
    startOver();
  };

  const status = fill(copy.progress, {
    current: formatNumber(locale, index + 1),
    total: formatNumber(locale, requestSteps.length),
  });

  return (
    <div ref={panelRef} className="scroll-mt-28 panel bg-raised p-5 shadow-card sm:p-8">
      {receipt ? (
        <Receipt locale={locale} receipt={receipt} copy={copy.receipt} onAnother={anotherRequest} />
      ) : (
        <FormProvider {...form}>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              if (step === "review") void submit();
              else next();
            }}
            className="flex flex-col gap-7"
          >
            {previous && (
              <PreviousReceipt
                locale={locale}
                receipt={previous}
                copy={copy.receipt}
                onDismiss={() => setPrevious(null)}
              />
            )}
            <StepIndicator
              step={step}
              furthest={furthest}
              labels={{
                type: copy.steps.type.label,
                product: copy.steps.product.label,
                details: copy.steps.details.label,
                contact: copy.steps.contact.label,
                review: copy.steps.review.label,
              }}
              progressLabel={copy.progressLabel}
              progress={copy.progress}
              onSelect={goTo}
            />
            <p aria-live="polite" className="sr-only">
              {`${status}: ${copy.steps[step].label}`}
            </p>
            <AnimatePresence
              mode="wait"
              initial={false}
              custom={{ direction, sign: locale === "fa" ? -1 : 1 }}
            >
              <m.div
                key={step}
                custom={{ direction, sign: locale === "fa" ? -1 : 1 }}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="flex flex-col gap-6"
              >
                <StepHeading
                  title={copy.steps[step].title}
                  description={copy.steps[step].description}
                  focusOnMount={interacted}
                />
                {step === "type" && <TypeStep legend={copy.steps.type.title} types={types} />}
                {step === "product" && (
                  <ProductStep locale={locale} models={models} copy={copy.product} />
                )}
                {step === "details" && (
                  <DetailsStep
                    locale={locale}
                    copy={copy}
                    files={files}
                    onFilesChange={(next) => {
                      setFiles(next);
                      setFilesError(undefined);
                    }}
                    filesError={filesError}
                  />
                )}
                {step === "contact" && <ContactStep locale={locale} copy={copy} />}
                {step === "review" && (
                  <ReviewStep
                    locale={locale}
                    copy={copy}
                    typeLabels={typeLabels}
                    models={models}
                    files={files}
                    altcha={altcha}
                    honeypotRef={honeypotRef}
                    onEdit={goTo}
                  />
                )}
              </m.div>
            </AnimatePresence>

            {submitError && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-field border border-danger/30 bg-danger-soft/70 p-3.5 text-sm leading-7 font-semibold text-danger"
              >
                <CircleAlert className="mt-1 size-4.5 shrink-0" aria-hidden />
                <span className="flex flex-col gap-1">
                  {submitError.message}
                  {submitError.track && (
                    <Link
                      href={localizePath(locale, routes.track)}
                      className="self-start text-primary underline underline-offset-4"
                    >
                      {copy.receipt.track}
                    </Link>
                  )}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-line pt-5">
              {index > 0 ? (
                <Button
                  variant="line"
                  size="lg"
                  onClick={() => goTo(requestSteps[index - 1] ?? "type")}
                  disabled={submitting}
                >
                  <ArrowRight className="size-4.5 ltr:rotate-180" aria-hidden />
                  {copy.nav.back}
                </Button>
              ) : (
                <span />
              )}
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="group min-w-36 shadow-primary"
              >
                {submitting ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" aria-hidden />
                    {copy.nav.submitting}
                  </>
                ) : step === "review" ? (
                  <>
                    <Send className="size-4.5 rtl:-scale-x-100" aria-hidden />
                    {copy.nav.submit}
                  </>
                ) : (
                  <>
                    {copy.nav.next}
                    <ArrowLeft
                      className="size-4.5 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </>
                )}
              </Button>
            </div>
            <div className="-mt-2 flex flex-wrap items-center justify-between gap-2 text-caption text-muted">
              <span className="inline-flex items-center gap-1.5">
                <HardDriveDownload className="size-3.5" aria-hidden />
                {copy.draftNote}
              </span>
              {furthest > 0 && (
                <button
                  type="button"
                  onClick={startOver}
                  className="inline-flex items-center gap-1 rounded-control px-2 py-1 font-bold transition-colors hover:bg-sunken hover:text-ink"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  {copy.nav.startOver}
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}

function FlowPlaceholder() {
  return (
    <div aria-hidden className="flex flex-col gap-7 panel bg-raised p-5 shadow-card sm:p-8">
      <Skeleton className="h-9 w-full rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-5 w-3/4" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 6 }, (_, item) => (
          <Skeleton key={item} className="h-24 rounded-card" />
        ))}
      </div>
      <div className="flex justify-end border-t border-line pt-5">
        <Skeleton className="h-13 w-36 rounded-field" />
      </div>
    </div>
  );
}

export function ServiceRequestFlow(props: ServiceRequestFlowProps) {
  const isClient = useIsClient();
  if (!isClient) return <FlowPlaceholder />;
  return (
    <Suspense fallback={<FlowPlaceholder />}>
      <RequestFlow {...props} />
    </Suspense>
  );
}
