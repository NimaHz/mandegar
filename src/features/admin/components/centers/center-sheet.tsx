"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api-client";
import { provinces } from "@/lib/provinces";
import type { AdminOption, AdminServiceCenter } from "@/types/admin";

import { adminContent } from "../../content";
import { enumOptions, toOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type ServiceCenterFormInput,
  serviceCenterFormSchema,
  type ServiceCenterFormValues,
} from "../../schemas";
import { CodeInput, NumberInput, SelectInput, SwitchInput } from "../form/fields";
import { fieldGridClass } from "../form/form-section";
import { FormSheet } from "../form/form-sheet";
import { LangScope } from "../form/lang-scope";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { MultiSelect } from "../form/multi-select";
import { Repeater } from "../form/repeater";
import { SlugField } from "../form/slug-field";

const copy = adminContent.centers;
const provinceOptions = provinces.map((province) => ({
  value: province.code,
  label: province.name.fa,
}));

interface CenterSheetProps {
  center: AdminServiceCenter | null;
  categories: AdminOption[];
  onClose: () => void;
  readOnly: boolean;
}

export function CenterSheet({ center, categories, onClose, readOnly }: CenterSheetProps) {
  const { run, pending } = useAdminMutation();
  const form = useForm<ServiceCenterFormInput, unknown, ServiceCenterFormValues>({
    resolver: zodResolver(serviceCenterFormSchema, zodOptions),
    defaultValues: {
      slug: center?.slug ?? "",
      kind: center?.kind ?? "service",
      name: center?.name ?? blankText(),
      province: center?.province ?? "",
      city: center?.city ?? blankText(),
      address: center?.address ?? blankText(),
      phones: (center?.phones ?? []).map((value) => ({ value })),
      hours: center?.hours ?? blankText(),
      lat: center?.lat ?? null,
      lng: center?.lng ?? null,
      categoryIds: center?.categoryIds ?? [],
      active: center?.active ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async ({ phones, ...values }) => {
    const body = { ...values, phones: phones.map((phone) => phone.value) };
    const saved = await run(
      () =>
        center
          ? apiClient.api.admin["service-centers"]({ id: center.id }).patch({
              ...body,
              expectedUpdatedAt: center.updatedAt,
            })
          : apiClient.api.admin["service-centers"].post(body),
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
      title={center ? copy.sheetEdit : copy.sheetCreate}
      description={center?.name.fa}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
      readOnly={readOnly}
    >
      <LangScope>
        <LocalizedField name="name" label={copy.fields.name} maxLength={120} />
        <div className={fieldGridClass}>
          <SlugField source="name.en" />
          <SelectInput
            name="kind"
            label={copy.fields.kind}
            options={enumOptions(adminContent.statuses.centerKind)}
          />
          <SelectInput
            name="province"
            label={copy.fields.province}
            options={provinceOptions}
            placeholder={adminContent.common.selectPlaceholder}
          />
          <LocalizedField name="city" label={copy.fields.city} maxLength={60} />
        </div>
        <LocalizedTextarea name="address" label={copy.fields.address} maxLength={300} rows={2} />
        <LocalizedField name="hours" label={copy.fields.hours} maxLength={200} />
      </LangScope>
      <div className="flex flex-col gap-2">
        <span className="text-label font-bold text-ink">{copy.fields.phones}</span>
        <Repeater
          name="phones"
          addLabel={copy.addPhone}
          emptyLabel={copy.emptyPhones}
          newItem={() => ({ value: "" })}
          max={6}
          compact
        >
          {(index) => (
            <CodeInput
              name={`phones.${index}.value`}
              label={copy.fields.phone}
              hideLabel
              placeholder="021-12345678"
            />
          )}
        </Repeater>
      </div>
      <div className={fieldGridClass}>
        <NumberInput
          name="lat"
          label={copy.fields.lat}
          placeholder="35.6892"
          hint={copy.fields.coordsHint}
        />
        <NumberInput name="lng" label={copy.fields.lng} placeholder="51.3890" />
      </div>
      <MultiSelect
        name="categoryIds"
        label={copy.fields.categories}
        options={toOptions(categories)}
        max={30}
      />
      <SwitchInput name="active" label={copy.fields.active} />
    </FormSheet>
  );
}
