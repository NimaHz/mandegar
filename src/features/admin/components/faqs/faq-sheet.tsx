"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api-client";
import type { AdminFaq } from "@/types/admin";

import { adminContent } from "../../content";
import { enumOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import { blankText, type FaqFormInput, faqFormSchema, type FaqFormValues } from "../../schemas";
import { NumberInput, SelectInput, SwitchInput } from "../form/fields";
import { fieldGridClass } from "../form/form-section";
import { FormSheet } from "../form/form-sheet";
import { LangScope } from "../form/lang-scope";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";

const copy = adminContent.faqs;

interface FaqSheetProps {
  faq: AdminFaq | null;
  onClose: () => void;
  readOnly: boolean;
}

export function FaqSheet({ faq, onClose, readOnly }: FaqSheetProps) {
  const { run, pending } = useAdminMutation();
  const form = useForm<FaqFormInput, unknown, FaqFormValues>({
    resolver: zodResolver(faqFormSchema, zodOptions),
    defaultValues: {
      group: faq?.group ?? "general",
      question: faq?.question ?? blankText(),
      answer: faq?.answer ?? blankText(),
      sortOrder: faq?.sortOrder ?? 0,
      published: faq?.published ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await run(
      () =>
        faq
          ? apiClient.api.admin.faqs({ id: faq.id }).patch(values)
          : apiClient.api.admin.faqs.post(values),
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
      onClose={onClose}
      title={faq ? copy.sheetEdit : copy.sheetCreate}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
      readOnly={readOnly}
    >
      <div className={fieldGridClass}>
        <SelectInput
          name="group"
          label={copy.fields.group}
          options={enumOptions(adminContent.statuses.faqGroup)}
        />
        <NumberInput name="sortOrder" label={copy.fields.sortOrder} />
      </div>
      <LangScope>
        <LocalizedTextarea name="question" label={copy.fields.question} maxLength={300} rows={2} />
        <LocalizedField name="answer" label={copy.fields.answer} markdown rows={8} />
      </LangScope>
      <SwitchInput name="published" label={copy.fields.published} />
    </FormSheet>
  );
}
