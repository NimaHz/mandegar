"use client";

import { PenLine } from "lucide-react";
import { useFormContext, useFormState, useWatch } from "react-hook-form";

import { CharCount } from "@/components/ui/char-count";
import { Field, TextAreaField } from "@/components/ui/field";
import type { Locale } from "@/i18n/config";

import type { RequestFlowContent } from "../../content";
import { mentionsGasSmell, type RequestValues, TICKET_ATTACHMENT_LIMIT } from "../../schemas";
import { AttachmentPicker } from "../attachment-picker";
import { GasSafetyCallout } from "../gas-safety-callout";

interface DetailsStepProps {
  locale: Locale;
  copy: RequestFlowContent;
  files: File[];
  onFilesChange: (files: File[]) => void;
  filesError: string | undefined;
}

const DESCRIPTION_LIMITS = { min: 10, max: 3000 };

export function DetailsStep({ locale, copy, files, onFilesChange, filesError }: DetailsStepProps) {
  const { register } = useFormContext<RequestValues>();
  const { errors } = useFormState<RequestValues>();
  const [subject, description] = useWatch<RequestValues, ["subject", "description"]>({
    name: ["subject", "description"],
  });
  const gas = mentionsGasSmell(`${subject} ${description}`);

  return (
    <div className="flex flex-col gap-5">
      <Field
        label={copy.details.subject}
        icon={PenLine}
        maxLength={120}
        placeholder={copy.details.subjectPlaceholder}
        error={errors.subject?.message}
        {...register("subject")}
      />
      <TextAreaField
        label={copy.details.description}
        rows={6}
        maxLength={3000}
        placeholder={copy.details.descriptionPlaceholder}
        error={errors.description?.message}
        hint={<CharCount value={description} limits={DESCRIPTION_LIMITS} />}
        {...register("description")}
      />
      {gas && (
        <GasSafetyCallout
          locale={locale}
          title={copy.gas.title}
          steps={copy.gas.steps}
          note={copy.gas.note}
        />
      )}
      <AttachmentPicker
        files={files}
        onChange={onFilesChange}
        max={TICKET_ATTACHMENT_LIMIT}
        error={filesError}
        labels={{ ...copy.attachments, optional: copy.product.optional }}
      />
    </div>
  );
}
