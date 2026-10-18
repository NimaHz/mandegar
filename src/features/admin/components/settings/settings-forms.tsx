"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink } from "lucide-react";
import { type ReactNode, useId, useState } from "react";
import {
  type FieldValues,
  FormProvider,
  type Resolver,
  useFormContext,
  useWatch,
} from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import { panelId, tabId, Tabs } from "@/components/ui/tabs";
import { mapLinks } from "@/features/info/map-links";
import { apiClient } from "@/lib/api-client";
import { z } from "@/lib/zod";
import {
  companySettingsSchema,
  contactSettingsSchema,
  featureSettingsSchema,
  officeLocationSchema,
  seoSettingsSchema,
  statsSettingsSchema,
} from "@/server/modules/settings/schema";
import type { SettingKey, SettingsValues, SettingVersions } from "@/types/admin";
import type { SocialLinks } from "@/types/content";

import { adminContent } from "../../content";
import { applyFieldErrors } from "../../lib/server-errors";
import { type EdenResult, useAdminMutation } from "../../lib/use-admin-mutation";
import { useEditorForm } from "../../lib/use-editor-form";
import { zodOptions } from "../../lib/zod";
import { blankText, blankToNull } from "../../schemas";
import { CodeInput, NumberInput, SwitchInput } from "../form/fields";
import { fieldGridClass, FormSection } from "../form/form-section";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { Repeater } from "../form/repeater";
import { SaveBar } from "../form/save-bar";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.settings;
const { conflict } = adminContent;
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

const resolvers = {
  contact: zodResolver(contactFormSchema, zodOptions),
  stats: zodResolver(statsSettingsSchema, zodOptions),
  company: zodResolver(companyFormSchema, zodOptions),
  seo: zodResolver(seoSettingsSchema, zodOptions),
  features: zodResolver(featureSettingsSchema, zodOptions),
};

interface SettingSection<TValue> {
  value: TValue;
  updatedAt: string | null;
}

interface SectionShellProps<TValue, TInput extends FieldValues, TOutput extends FieldValues> {
  value: TValue;
  version: string | null;
  toForm: (value: TValue) => TInput;
  resolver: Resolver<TInput, unknown, TOutput>;
  save: (
    values: TOutput,
    expectedUpdatedAt: string | undefined,
  ) => Promise<EdenResult<SettingSection<TValue>>>;
  load: () => Promise<EdenResult<SettingSection<TValue>>>;
  children: ReactNode;
}

function SectionShell<TValue, TInput extends FieldValues, TOutput extends FieldValues>({
  value,
  version: loadedVersion,
  toForm,
  resolver,
  save,
  load,
  children,
}: SectionShellProps<TValue, TInput, TOutput>) {
  const { run, pending } = useAdminMutation();
  const { form, isDirty, capture, commit, discard, rebase } = useEditorForm<TInput, TOutput>({
    resolver,
    defaultValues: toForm(value),
  });
  const [version, setVersion] = useState(loadedVersion);

  const reload = async () => {
    const latest = await run(load, {
      success: conflict.reloaded,
      description: conflict.reloadedHint,
      onSuccess: (data) => setVersion(data.updatedAt),
    });
    if (latest) rebase(toForm(latest.value));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const snapshot = capture();
    const saved = await run(() => save(values, version ?? undefined), {
      success: copy.saved,
      onSuccess: (data) => setVersion(data.updatedAt),
      onError: (error) => applyFieldErrors(form.setError, error),
      onStale: () => void reload(),
    });
    if (saved) commit(snapshot, toForm(saved.value));
  });

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        {children}
        <SaveBar dirty={isDirty} pending={pending} onDiscard={discard} />
      </form>
    </FormProvider>
  );
}

interface SectionProps<TKey extends SettingKey> {
  value: SettingsValues[TKey];
  version: string | null;
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

const contactToForm = (value: SettingsValues["contact"]): z.input<typeof contactFormSchema> => ({
  ...value,
  socials: Object.fromEntries(socialKeys.map((key) => [key, value.socials[key] ?? ""])) as Record<
    keyof SocialLinks,
    string
  >,
  location: value.location ?? { lat: null, lng: null },
});

function ContactForm({ value, version }: SectionProps<"contact">) {
  return (
    <SectionShell
      value={value}
      version={version}
      toForm={contactToForm}
      resolver={resolvers.contact}
      save={(values, expectedUpdatedAt) =>
        apiClient.api.admin.settings.contact.put({ ...values, expectedUpdatedAt })
      }
      load={() => apiClient.api.admin.settings.contact.get()}
    >
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

function StatsForm({ value, version }: SectionProps<"stats">) {
  return (
    <SectionShell
      value={value}
      version={version}
      toForm={(stats): z.input<typeof statsSettingsSchema> => stats}
      resolver={resolvers.stats}
      save={(values, expectedUpdatedAt) =>
        apiClient.api.admin.settings.stats.put({ ...values, expectedUpdatedAt })
      }
      load={() => apiClient.api.admin.settings.stats.get()}
    >
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

const companyToForm = (value: SettingsValues["company"]): z.input<typeof companyFormSchema> => ({
  ...value,
  nationalId: value.nationalId ?? "",
  registrationNo: value.registrationNo ?? "",
});

function CompanyForm({ value, version }: SectionProps<"company">) {
  return (
    <SectionShell
      value={value}
      version={version}
      toForm={companyToForm}
      resolver={resolvers.company}
      save={(values, expectedUpdatedAt) =>
        apiClient.api.admin.settings.company.put({ ...values, expectedUpdatedAt })
      }
      load={() => apiClient.api.admin.settings.company.get()}
    >
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

function SeoForm({ value, version }: SectionProps<"seo">) {
  return (
    <SectionShell
      value={value}
      version={version}
      toForm={(seo): z.input<typeof seoSettingsSchema> => seo}
      resolver={resolvers.seo}
      save={(values, expectedUpdatedAt) =>
        apiClient.api.admin.settings.seo.put({ ...values, expectedUpdatedAt })
      }
      load={() => apiClient.api.admin.settings.seo.get()}
    >
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

function FeaturesForm({ value, version }: SectionProps<"features">) {
  return (
    <SectionShell
      value={value}
      version={version}
      toForm={(features): z.input<typeof featureSettingsSchema> => features}
      resolver={resolvers.features}
      save={(values, expectedUpdatedAt) =>
        apiClient.api.admin.settings.features.put({ ...values, expectedUpdatedAt })
      }
      load={() => apiClient.api.admin.settings.features.get()}
    >
      <FormSection title={copy.features.section} description={copy.features.hint}>
        <SwitchInput name="blog" label={copy.features.blog} description={copy.features.blogHint} />
      </FormSection>
    </SectionShell>
  );
}

interface SettingsFormsProps {
  settings: SettingsValues;
  versions: SettingVersions;
}

export function SettingsForms({ settings, versions }: SettingsFormsProps) {
  const tabsId = useId();
  const [tab, setTab] = useState<SettingKey>("contact");
  const items = (Object.keys(copy.tabs) as SettingKey[]).map((value) => ({
    value,
    label: copy.tabs[value],
  }));
  const panels: Record<SettingKey, ReactNode> = {
    contact: <ContactForm value={settings.contact} version={versions.contact} />,
    stats: <StatsForm value={settings.stats} version={versions.stats} />,
    company: <CompanyForm value={settings.company} version={versions.company} />,
    seo: <SeoForm value={settings.seo} version={versions.seo} />,
    features: <FeaturesForm value={settings.features} version={versions.features} />,
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
