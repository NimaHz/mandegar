"use client";

import { BadgeCheck, Info, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { CodeInput, type CodeInspection, inspectCode } from "@/components/shared/code-input";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { apiClient, apiResult } from "@/lib/api-client";
import { jalaliToGregorianYear } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { ModelOption } from "@/types/catalog";
import type { WarrantyMatch } from "@/types/warranty";

import type { RequestFlowContent } from "../../content";
import type { RequestValues } from "../../schemas";
import { ModelPicker } from "./model-picker";
import { PurchaseDateInput } from "./purchase-date-input";

type LookupState =
  | { status: "idle" }
  | { status: "loading"; code: string }
  | { status: "found"; code: string; match: WarrantyMatch }
  | { status: "miss"; code: string };

interface ProductStepProps {
  locale: Locale;
  models: ModelOption[];
  copy: RequestFlowContent["product"];
}

const lookupCode = async (
  locale: Locale,
  code: string,
): Promise<Extract<LookupState, { status: "found" | "miss" }>> => {
  const result = await apiResult(apiClient.api.warranty.lookup.post({ code, locale }));
  return result.ok && result.data.status === "found"
    ? { status: "found", code, match: result.data.match }
    : { status: "miss", code };
};

export function ProductStep({ locale, models, copy }: ProductStepProps) {
  const { control, getValues } = useFormContext<RequestValues>();
  const code = useWatch<RequestValues, "warrantyCode">({ name: "warrantyCode" });
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });

  useEffect(() => {
    const initial = getValues("warrantyCode");
    if (!inspectCode("warranty", initial).valid) return;
    let active = true;
    void lookupCode(locale, initial).then((state) => {
      if (active) setLookup(state);
    });
    return () => {
      active = false;
    };
  }, [getValues, locale]);

  const onCodeChange = (inspection: CodeInspection) => {
    if (!inspection.valid) {
      setLookup({ status: "idle" });
      return;
    }
    setLookup({ status: "loading", code: inspection.code });
    void lookupCode(locale, inspection.code).then((state) =>
      setLookup((current) =>
        current.status === "loading" && current.code === state.code ? state : current,
      ),
    );
  };

  const current = lookup.status !== "idle" && lookup.code === code ? lookup : null;
  const matched = current?.status === "found" ? current.match : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Controller
          control={control}
          name="warrantyCode"
          render={({ field, fieldState }) => (
            <CodeInput
              ref={field.ref}
              kind="warranty"
              size="md"
              name={field.name}
              value={field.value}
              onBlur={field.onBlur}
              onValueChange={(inspection) => {
                field.onChange(inspection.code);
                onCodeChange(inspection);
              }}
              error={fieldState.error?.message}
              messages={{ ...copy.code, label: `${copy.code.label} (${copy.optional})` }}
            />
          )}
        />
        {current?.status === "loading" && (
          <p
            role="status"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted"
          >
            <LoaderCircle className="size-4 animate-spin" aria-hidden />
            {copy.lookingUp}
          </p>
        )}
        {matched && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-field border border-success/30 bg-success-soft/60 p-3"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-success text-white dark:text-night">
              <BadgeCheck className="size-5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-caption font-bold text-success">{copy.matched}</span>
              <span className="truncate text-sm font-bold text-ink">{matched.product.name}</span>
              <span className="text-caption text-muted">
                <bdi dir="ltr" className="font-code font-semibold">
                  {matched.product.modelCode}
                </bdi>
                <span aria-hidden> · </span>
                {fill(copy.matchedYear, {
                  year:
                    locale === "fa"
                      ? formatNumber(locale, matched.productionYear, { useGrouping: false })
                      : String(jalaliToGregorianYear(matched.productionYear)),
                })}
              </span>
            </span>
          </div>
        )}
        {current?.status === "miss" && (
          <p
            role="status"
            className="flex items-start gap-2 rounded-field bg-warning-soft/70 p-3 text-xs leading-6 font-semibold text-warning"
          >
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            {copy.lookupMiss}
          </p>
        )}
      </div>

      {!matched && (
        <>
          <div className="flex items-center gap-3 text-caption font-bold text-muted" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            {copy.or}
            <span className="h-px flex-1 bg-line" />
          </div>
          <Controller
            control={control}
            name="productSlug"
            render={({ field, fieldState }) => (
              <ModelPicker
                models={models}
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
                labels={{
                  label: copy.model,
                  optional: copy.optional,
                  placeholder: copy.modelPlaceholder,
                  empty: copy.modelEmpty,
                  clear: copy.modelClear,
                  hint: copy.modelHint,
                }}
              />
            )}
          />
        </>
      )}

      <Controller
        control={control}
        name="purchaseDate"
        render={({ field, fieldState }) => (
          <PurchaseDateInput
            locale={locale}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
            labels={{
              label: copy.purchaseDate,
              optional: copy.optional,
              hint: copy.purchaseHint,
              year: copy.year,
              month: copy.month,
              day: copy.day,
              clear: copy.clearDate,
              months: copy.months,
            }}
          />
        )}
      />
    </div>
  );
}
