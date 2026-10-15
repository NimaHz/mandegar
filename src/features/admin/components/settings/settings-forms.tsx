"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
  type FieldValues,
  FormProvider,
  useForm,
  useFormContext,
  type UseFormReturn,
  useFormState,
  useWatch,
} from "react-hook-form";
import { z } from "zod";

import { buttonVariants } from "@/components/ui/button";
import { panelId, tabId, Tabs } from "@/components/ui/tabs";
import { mapLinks } from "@/features/info/map-links";
import { apiClient } from "@/lib/api-client";
import {
  companySettingsSchema,
  contactSettingsSchema,
  officeLocationSchema,
  seoSettingsSchema,
  statsSettingsSchema,
} from "@/server/modules/settings/schema";
import type { SettingKey, SettingsValues } from "@/types/admin";
import type { SocialLinks } from "@/types/content";

import { adminContent } from "../../content";
import { applyFieldErrors } from "../../lib/server-errors";
import { type EdenResult, useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import { blankText, blankToNull } from "../../schemas";
import { CodeInput, NumberInput } from "../form/fields";
import { fieldGridClass, FormSection } from "../form/form-section";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { Repeater } from "../form/repeater";
import { SaveBar } from "../form/save-bar";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.settings;
const socialKeys = Object.keys(copy.socials) as (keyof SocialLinks)[];

const social = z.preprocess(
  blankToNull,
  z
    .url({ protocol: /^https$/ })
    .max(300)
    .nullable(),
);

const isBlankCoordinate = (value: unknown) => value === null || value === undefined || value === "";

const locationField = z.preprocess(
  (value) =>
    typeof value === "object" &&
    value !== null &&
    "lat" in value &&
    "lng" in value &&
    isBlankCoordinate(value.lat) &&
    isBlankCoordinate(value.lng)
      ? null
      : value,
  officeLocationSchema.nullable(),
);

const contactFormSchema = contactSettingsSchema.extend({
  location: locationField,
  socials: z.object({
    aparat: social,
    instagram: social,
    telegram: social,
    bale: social,
    eitaa: social,
    rubika: social,
    linkedin: social,
  }),
});

const companyFormSchema = companySettingsSchema.extend({
  nationalId: z.preprocess(blankToNull, companySettingsSchema.shape.nationalId),
  registrationNo: z.preprocess(blankToNull, companySettingsSchema.shape.registrationNo),
});

interface SectionShellProps<TInput extends FieldValues, TOutput extends FieldValues> {
  form: UseFormReturn<TInput, unknown, TOutput>;
  save: (values: TOutput) => Promise<EdenResult<unknown>>;
  children: ReactNode;
}

function SectionShell<TInput extends FieldValues, TOutput extends FieldValues>({
  form,
  save,
  children,
}: SectionShellProps<TInput, TOutput>) {
  const { run, pending } = useAdminMutation();
  const { isDirty } = useFormState({ control: form.control });
  const onSubmit = form.handleSubmit(async (values) => {
    const snapshot = form.getValues();
    const saved = await run(() => save(values), {
      success: copy.saved,
      onError: (error) => applyFieldErrors(form.setError, error),
    });
    if (saved) form.reset(snapshot);
  });

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        <SaveBar dirty={isDirty} pending={pending} onDiscard={() => form.reset()} />
      </form>
    </FormProvider>
  );
}

interface LabeledRepeaterProps {
  name: string;
  add: string;
  empty: string;
  label: string;
  placeholder: string;
}

function LabeledRepeater({ name, add, empty, label, placeholder }: LabeledRepeaterProps) {
  return (
    <Repeater
      name={name}
      addLabel={add}
      emptyLabel={empty}
      newItem={() => ({ label: blankText(), value: "" })}
      max={10}
      compact
    >
      {(index) => (
        <div className={fieldGridClass}>
          <LocalizedField name={`${name}.${index}.label`} label={copy.contact.label} />
          <CodeInput name={`${name}.${index}.value`} label={label} placeholder={placeholder} />
        </div>
      )}
    </Repeater>
  );
}

function LocationPreview() {
  const { control } = useFormContext();
  const location = officeLocationSchema.safeParse(useWatch({ control, name: "location" }));
  if (!location.success) return null;
  return (
    <a
      href={mapLinks(location.data).neshan}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonVariants({ variant: "line", size: "sm" })}
    >
      <ExternalLink className="size-3.5" aria-hidden />
      {copy.contact.previewNeshan}
    </a>
  );
}

function ContactForm({ value }: { value: SettingsValues["contact"] }) {
  const form = useForm<
    z.input<typeof contactFormSchema>,
    unknown,
    z.output<typeof contactFormSchema>
  >({
    resolver: zodResolver(contactFormSchema, zodOptions),
    defaultValues: {
      ...value,
      socials: Object.fromEntries(socialKeys.map((key) => [key, value.socials[key] ?? ""])),
      location: value.location ?? { lat: null, lng: null },
    },
  });

  return (
    <SectionShell form={form} save={(values) => apiClient.api.admin.settings.contact.put(values)}>
      <FormSection
        step={1}
        title={copy.contact.phones}
        description={copy.contact.phonesHint}
        localized
      >
        <LabeledRepeater
          name="phones"
          add={copy.contact.addPhone}
          empty={copy.contact.emptyPhones}
          label={copy.contact.phone}
          placeholder="021-12345678"
        />
      </FormSection>
      <FormSection step={2} title={copy.contact.emails} localized>
        <LabeledRepeater
          name="emails"
          add={copy.contact.addEmail}
          empty={copy.contact.emptyEmails}
          label={copy.contact.email}
          placeholder="info@mandegar.ir"
        />
      </FormSection>
      <FormSection step={3} title={copy.contact.address} localized>
        <LocalizedTextarea
          name="address"
          label={copy.contact.addressField}
          maxLength={300}
          rows={2}
        />
        <LocalizedField name="hours" label={copy.contact.hours} maxLength={200} />
      </FormSection>
      <FormSection
        step={4}
        title={copy.contact.location}
        description={copy.contact.locationHint}
        action={<LocationPreview />}
      >
        <div className={fieldGridClass}>
          <NumberInput
            name="location.lat"
            label={copy.contact.lat}
            placeholder="35.7009"
            hint={copy.contact.latHint}
          />
          <NumberInput
            name="location.lng"
            label={copy.contact.lng}
            placeholder="51.3899"
            hint={copy.contact.lngHint}
          />
        </div>
      </FormSection>
      <FormSection step={5} title={copy.contact.socials} description={copy.contact.socialsHint}>
        <div className={fieldGridClass}>
          {socialKeys.map((key) => (
            <CodeInput
              key={key}
              name={`socials.${key}`}
              label={copy.socials[key]}
              placeholder="https://"
            />
          ))}
        </div>
      </FormSection>
    </SectionShell>
  );
}

function StatsForm({ value }: { value: SettingsValues["stats"] }) {
  const form = useForm<
    z.input<typeof statsSettingsSchema>,
    unknown,
    z.output<typeof statsSettingsSchema>
  >({
    resolver: zodResolver(statsSettingsSchema, zodOptions),
    defaultValues: value,
  });

  return (
    <SectionShell form={form} save={(values) => apiClient.api.admin.settings.stats.put(values)}>
      <FormSection title={copy.stats.section} description={copy.stats.hint}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <NumberInput name="years" label={copy.stats.years} />
          <NumberInput name="serviceCenters" label={copy.stats.serviceCenters} />
          <NumberInput name="models" label={copy.stats.models} />
          <NumberInput name="warrantyMonths" label={copy.stats.warrantyMonths} />
        </div>
      </FormSection>
    </SectionShell>
  );
}

function CompanyForm({ value }: { value: SettingsValues["company"] }) {
  const form = useForm<
    z.input<typeof companyFormSchema>,
    unknown,
    z.output<typeof companyFormSchema>
  >({
    resolver: zodResolver(companyFormSchema, zodOptions),
    defaultValues: {
      ...value,
      nationalId: value.nationalId ?? "",
      registrationNo: value.registrationNo ?? "",
    },
  });

  return (
    <SectionShell form={form} save={(values) => apiClient.api.admin.settings.company.put(values)}>
      <FormSection title={copy.company.section} description={copy.company.hint} localized>
        <LocalizedField name="legalName" label={copy.company.legalName} maxLength={200} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <CodeInput name="nationalId" label={copy.company.nationalId} />
          <CodeInput name="registrationNo" label={copy.company.registrationNo} />
          <NumberInput name="foundingYear" label={copy.company.foundingYear} />
        </div>
      </FormSection>
    </SectionShell>
  );
}

function SeoForm({ value }: { value: SettingsValues["seo"] }) {
  const form = useForm<
    z.input<typeof seoSettingsSchema>,
    unknown,
    z.output<typeof seoSettingsSchema>
  >({
    resolver: zodResolver(seoSettingsSchema, zodOptions),
    defaultValues: value,
  });

  return (
    <SectionShell form={form} save={(values) => apiClient.api.admin.settings.seo.put(values)}>
      <FormSection title={copy.seo.section} description={copy.seo.hint} localized>
        <LocalizedField name="defaultTitle" label={copy.seo.title} maxLength={80} />
        <LocalizedTextarea
          name="defaultDescription"
          label={copy.seo.description}
          maxLength={200}
          rows={3}
        />
      </FormSection>
    </SectionShell>
  );
}

export function SettingsForms({ settings }: { settings: SettingsValues }) {
  const tabsId = useId();
  const [tab, setTab] = useState<SettingKey>("contact");
  const items = (Object.keys(copy.tabs) as SettingKey[]).map((value) => ({
    value,
    label: copy.tabs[value],
  }));
  const panels: Record<SettingKey, ReactNode> = {
    contact: <ContactForm value={settings.contact} />,
    stats: <StatsForm value={settings.stats} />,
    company: <CompanyForm value={settings.company} />,
    seo: <SeoForm value={settings.seo} />,
  };

  return (
    <div className="flex flex-col gap-5">
      <PanelHeading
        eyebrow={adminContent.shell.groups.settings}
        title={copy.title}
        description={copy.description}
      />
      <Tabs
        items={items}
        value={tab}
        onChange={setTab}
        label={copy.title}
        idPrefix={tabsId}
        className="self-start"
      />
      {items.map((item) => (
        <div
          key={item.value}
          role="tabpanel"
          id={panelId(tabsId, item.value)}
          aria-labelledby={tabId(tabsId, item.value)}
          hidden={tab !== item.value}
        >
          {panels[item.value]}
        </div>
      ))}
    </div>
  );
}
