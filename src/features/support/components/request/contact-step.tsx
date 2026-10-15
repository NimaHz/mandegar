"use client";

import { Building2, UserRound } from "lucide-react";
import { useFormContext, useFormState } from "react-hook-form";

import { Field, TextAreaField } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { normalizeMobile } from "@/lib/persian";
import { provinces } from "@/lib/provinces";

import type { RequestFlowContent } from "../../content";
import type { RequestValues } from "../../schemas";

interface ContactStepProps {
  locale: Locale;
  copy: RequestFlowContent;
}

export function ContactStep({ locale, copy }: ContactStepProps) {
  const { register, setValue } = useFormContext<RequestValues>();
  const { errors } = useFormState<RequestValues>();
  const labels = copy.contact;
  const provinceOptions = provinces
    .map((province) => ({ value: province.code, label: province.name[locale] }))
    .toSorted((left, right) => left.label.localeCompare(right.label, locale));
  const provinceError = errors.province?.message;
  const ltrAlign = locale === "fa" ? "text-end" : undefined;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field
        label={labels.name}
        icon={UserRound}
        autoComplete="name"
        maxLength={80}
        error={errors.name?.message}
        wrapperClassName="sm:col-span-2"
        {...register("name")}
      />
      <Field
        label={labels.phone}
        type="tel"
        inputMode="tel"
        dir="ltr"
        autoComplete="tel-national"
        placeholder={labels.phonePlaceholder}
        maxLength={20}
        hint={labels.phoneHint}
        error={errors.phone?.message}
        className={ltrAlign}
        {...register("phone", {
          onBlur: (event: { target: { value: string } }) => {
            const mobile = normalizeMobile(event.target.value);
            if (mobile) setValue("phone", mobile, { shouldValidate: true });
          },
        })}
      />
      <Field
        label={`${labels.email} (${copy.product.optional})`}
        type="email"
        dir="ltr"
        autoComplete="email"
        placeholder="name@example.com"
        maxLength={120}
        error={errors.email?.message}
        className={ltrAlign}
        {...register("email")}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="request-province" className="text-label font-bold text-ink">
          {labels.province}
        </label>
        <Select
          id="request-province"
          icon={Building2}
          autoComplete="address-level1"
          placeholder={labels.provincePlaceholder}
          options={provinceOptions}
          aria-invalid={provinceError ? true : undefined}
          aria-describedby={provinceError ? "request-province-error" : undefined}
          className={cn("h-12 rounded-field text-lead", provinceError && "border-danger")}
          {...register("province")}
        />
        {provinceError && (
          <p id="request-province-error" className="text-xs font-semibold text-danger">
            {provinceError}
          </p>
        )}
      </div>
      <Field
        label={labels.city}
        autoComplete="address-level2"
        maxLength={60}
        error={errors.city?.message}
        {...register("city")}
      />
      <TextAreaField
        label={labels.address}
        rows={3}
        maxLength={300}
        autoComplete="street-address"
        placeholder={labels.addressPlaceholder}
        error={errors.address?.message}
        wrapperClassName="sm:col-span-2"
        className="min-h-20"
        {...register("address")}
      />
    </div>
  );
}
