"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api-client";
import type { AdminBrand } from "@/types/admin";

import { adminContent } from "../../content";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type BrandFormInput,
  brandFormSchema,
  type BrandFormValues,
} from "../../schemas";
import { CodeInput, NumberInput, SwitchInput } from "../form/fields";
import { fieldGridClass } from "../form/form-section";
import { FormSheet } from "../form/form-sheet";
import { LangScope } from "../form/lang-scope";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { SlugField } from "../form/slug-field";
import { MediaField } from "../media/media-field";

const copy = adminContent.brands;

const toForm = (brand: AdminBrand | null): BrandFormInput => ({
  slug: brand?.slug ?? "",
  name: brand?.name ?? blankText(),
  description: brand?.description ?? blankText(),
  logoMediaId: brand?.logoMediaId ?? null,
  website: brand?.website ?? "",
  isOwn: brand?.isOwn ?? false,
  sortOrder: brand?.sortOrder ?? 0,
  published: brand?.published ?? true,
});

interface BrandSheetProps {
  brand: AdminBrand | null;
  onClose: () => void;
  readOnly: boolean;
}

export function BrandSheet({ brand, onClose, readOnly }: BrandSheetProps) {
  const { run, pending } = useAdminMutation();
  const form = useForm<BrandFormInput, unknown, BrandFormValues>({
    resolver: zodResolver(brandFormSchema, zodOptions),
    defaultValues: toForm(brand),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const saved = await run(
      () =>
        brand
          ? apiClient.api.admin
              .brands({ id: brand.id })
              .patch({ ...values, expectedUpdatedAt: brand.updatedAt })
          : apiClient.api.admin.brands.post(values),
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
      title={brand ? copy.sheetEdit : copy.sheetCreate}
      description={brand?.name.fa}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
      readOnly={readOnly}
    >
      <LangScope>
        <LocalizedField name="name" label={copy.fields.name} maxLength={80} />
        <SlugField source="name.en" />
        <LocalizedTextarea
          name="description"
          label={copy.fields.description}
          maxLength={3000}
          rows={4}
        />
      </LangScope>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[12rem_minmax(0,1fr)]">
        <MediaField
          name="logoMediaId"
          label={copy.fields.logo}
          initial={brand?.logo ?? null}
          aspect="aspect-square"
          fit="contain"
        />
        <div className="flex flex-col gap-4">
          <CodeInput name="website" label={copy.fields.website} placeholder="https://" />
          <NumberInput name="sortOrder" label={copy.fields.sortOrder} />
        </div>
      </div>
      <div className={fieldGridClass}>
        <SwitchInput name="isOwn" label={copy.fields.isOwn} description={copy.fields.isOwnHint} />
        <SwitchInput name="published" label={copy.fields.published} />
      </div>
    </FormSheet>
  );
}
