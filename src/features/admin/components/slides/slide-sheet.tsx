"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import { apiClient } from "@/lib/api-client";
import type { AdminMediaRef, AdminSlide } from "@/types/admin";

import { adminContent } from "../../content";
import { fromLocalInput, toLocalInput } from "../../lib/datetime";
import { enumOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type SlideFormInput,
  slideFormSchema,
  type SlideFormValues,
} from "../../schemas";
import { CodeInput, DateTimeInput, NumberInput, SelectInput, SwitchInput } from "../form/fields";
import { fieldGridClass } from "../form/form-section";
import { FormSheet } from "../form/form-sheet";
import { LangScope } from "../form/lang-scope";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { MediaField } from "../media/media-field";
import { SlidePreview } from "./slide-preview";

const copy = adminContent.slides;

interface SlideSheetProps {
  slide: AdminSlide | null;
  nextOrder: number;
  onClose: () => void;
  readOnly: boolean;
}

export function SlideSheet({ slide, nextOrder, onClose, readOnly }: SlideSheetProps) {
  const { run, pending } = useAdminMutation();
  const [image, setImage] = useState<AdminMediaRef | null>(slide?.image ?? null);
  const form = useForm<SlideFormInput, unknown, SlideFormValues>({
    resolver: zodResolver(slideFormSchema, zodOptions),
    defaultValues: {
      title: slide?.title ?? blankText(),
      subtitle: slide?.subtitle ?? blankText(),
      ctaLabel: slide?.ctaLabel ?? blankText(),
      ctaHref: slide?.ctaHref ?? "",
      imageMediaId: slide?.imageMediaId ?? "",
      mobileImageMediaId: slide?.mobileImageMediaId ?? null,
      tone: slide?.tone ?? "dark",
      sortOrder: slide?.sortOrder ?? nextOrder,
      active: slide?.active ?? true,
      startsAt: toLocalInput(slide?.startsAt ?? null),
      endsAt: toLocalInput(slide?.endsAt ?? null),
    },
  });
  const [title, subtitle, cta, tone] = useWatch({
    control: form.control,
    name: ["title.fa", "subtitle.fa", "ctaLabel", "tone"],
  });
  const ctaText =
    typeof cta === "object" && cta !== null && "fa" in cta && typeof cta.fa === "string"
      ? cta.fa
      : "";

  const onSubmit = form.handleSubmit(async (values) => {
    const body = {
      ...values,
      startsAt: fromLocalInput(values.startsAt),
      endsAt: fromLocalInput(values.endsAt),
    };
    const saved = await run(
      () =>
        slide
          ? apiClient.api.admin.slides({ id: slide.id }).patch(body)
          : apiClient.api.admin.slides.post(body),
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
      title={slide ? copy.sheetEdit : copy.sheetCreate}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
      readOnly={readOnly}
    >
      <section className="flex flex-col gap-2" aria-label={copy.preview}>
        <span className="text-caption font-extrabold text-muted">{copy.preview}</span>
        <SlidePreview
          image={image}
          title={title || "—"}
          subtitle={subtitle ?? ""}
          cta={ctaText}
          tone={tone === "light" ? "light" : "dark"}
        />
      </section>
      <LangScope>
        <LocalizedField name="title" label={copy.fields.title} maxLength={120} />
        <LocalizedTextarea name="subtitle" label={copy.fields.subtitle} maxLength={300} rows={2} />
        <div className={fieldGridClass}>
          <LocalizedField name="ctaLabel" label={copy.fields.ctaLabel} maxLength={40} />
          <CodeInput
            name="ctaHref"
            label={copy.fields.ctaHref}
            hint={copy.fields.ctaHrefHint}
            placeholder="/products"
          />
        </div>
      </LangScope>
      <div className={fieldGridClass}>
        <MediaField
          name="imageMediaId"
          label={copy.fields.image}
          initial={slide?.image ?? null}
          aspect="aspect-[16/7]"
          onMedia={setImage}
        />
        <MediaField
          name="mobileImageMediaId"
          label={copy.fields.mobileImage}
          initial={slide?.mobileImage ?? null}
          aspect="aspect-[16/7]"
          fit="contain"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SelectInput
          name="tone"
          label={copy.fields.tone}
          options={enumOptions(adminContent.statuses.tone)}
        />
        <NumberInput name="sortOrder" label={copy.fields.sortOrder} />
        <DateTimeInput name="startsAt" label={copy.fields.startsAt} hint={copy.fields.dateHint} />
        <DateTimeInput name="endsAt" label={copy.fields.endsAt} hint={copy.fields.dateHint} />
      </div>
      <SwitchInput name="active" label={copy.fields.active} />
    </FormSheet>
  );
}
