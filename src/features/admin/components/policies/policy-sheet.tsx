"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { useForm } from "react-hook-form";

import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { todayIsoDate } from "@/lib/dates";
import type { AdminWarrantyPolicy } from "@/types/admin";

import { adminContent } from "../../content";
import { faNumber } from "../../lib/format";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type PolicyFormInput,
  policyFormSchema,
  type PolicyFormValues,
} from "../../schemas";
import { NumberInput, TextInput } from "../form/fields";
import { FormSection } from "../form/form-section";
import { FormSheet } from "../form/form-sheet";
import { LangScope } from "../form/lang-scope";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { ReadOnlyScope } from "../form/read-only";
import { Repeater } from "../form/repeater";

const copy = adminContent.policies;

interface PolicySheetProps {
  policy: AdminWarrantyPolicy | null;
  onClose: () => void;
}

export function PolicySheet({ policy, onClose }: PolicySheetProps) {
  const { run, pending } = useAdminMutation();
  const codeCount = policy?.codeCount ?? 0;
  const locked = codeCount > 0;
  const form = useForm<PolicyFormInput, unknown, PolicyFormValues>({
    resolver: zodResolver(policyFormSchema, zodOptions),
    defaultValues: {
      name: policy?.name ?? blankText(),
      months: policy?.months ?? 18,
      partsMonths: policy?.partsMonths ?? null,
      startRule: policy?.startRule ?? blankText(),
      coverage: policy?.coverage ?? [],
      exclusions: policy?.exclusions ?? [],
      effectiveFrom: policy?.effectiveFrom ?? todayIsoDate(),
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await run(
      () =>
        policy
          ? apiClient.api.admin["warranty-policies"]({ id: policy.id }).patch(values)
          : apiClient.api.admin["warranty-policies"].post(values),
      { success: copy.saved, onError: (error) => applyFieldErrors(form.setError, error) },
    );
    if (saved) {
      form.reset(form.getValues());
      onClose();
    }
  });

  return (
    <FormSheet
      open
      wide
      onClose={onClose}
      title={policy ? copy.sheetEdit : copy.sheetCreate}
      description={policy?.name.fa}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
    >
      {locked && (
        <p className="flex items-start gap-3 rounded-card border border-warning/40 bg-warning-soft px-4 py-3 text-sm leading-7 font-bold text-warning">
          <Lock className="mt-1.5 size-4 shrink-0" aria-hidden />
          {fill(copy.locked, { count: faNumber(codeCount) })}
        </p>
      )}
      <LangScope>
        <LocalizedField
          name="name"
          label={copy.fields.name}
          placeholder={copy.fields.namePlaceholder}
          maxLength={80}
        />
      </LangScope>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextInput name="effectiveFrom" type="date" dir="ltr" label={copy.fields.effectiveFrom} />
        <NumberInput name="months" label={copy.fields.months} readOnly={locked} />
        <NumberInput
          name="partsMonths"
          label={copy.fields.partsMonths}
          hint={copy.fields.partsHint}
          readOnly={locked}
        />
      </div>
      <ReadOnlyScope readOnly={locked}>
        <LangScope>
          <LocalizedTextarea
            name="startRule"
            label={copy.fields.startRule}
            maxLength={400}
            rows={2}
          />
          <FormSection title={copy.fields.coverage} localized>
            <Repeater
              name="coverage"
              addLabel={copy.addCoverage}
              emptyLabel={copy.emptyCoverage}
              newItem={() => ({ ...blankText() })}
              max={30}
              compact
            >
              {(index) => (
                <LocalizedTextarea
                  name={`coverage.${index}`}
                  label={copy.fields.item}
                  maxLength={300}
                  rows={2}
                />
              )}
            </Repeater>
          </FormSection>
          <FormSection title={copy.fields.exclusions} localized>
            <Repeater
              name="exclusions"
              addLabel={copy.addExclusion}
              emptyLabel={copy.emptyCoverage}
              newItem={() => ({ ...blankText() })}
              max={30}
              compact
            >
              {(index) => (
                <LocalizedTextarea
                  name={`exclusions.${index}`}
                  label={copy.fields.item}
                  maxLength={300}
                  rows={2}
                />
              )}
            </Repeater>
          </FormSection>
        </LangScope>
      </ReadOnlyScope>
    </FormSheet>
  );
}
