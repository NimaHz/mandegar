"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Trash, Wand2 } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { FormProvider, useWatch } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { localizePath } from "@/i18n/paths";
import { apiClient } from "@/lib/api-client";
import { formatDateTime } from "@/lib/dates";
import { adminRoutes, routes } from "@/lib/routes";
import type { AdminOption, AdminProduct } from "@/types/admin";
import { energyClasses } from "@/types/catalog";

import { adminContent } from "../../content";
import type { AdminApiError } from "../../lib/api-error";
import { enumOptions, toOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { slugify } from "../../lib/slug";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useEditorForm } from "../../lib/use-editor-form";
import { leaveGuardedEntry } from "../../lib/use-unsaved-guard";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type ProductFormInput,
  productFormSchema,
  type ProductFormValues,
  seoToForm,
} from "../../schemas";
import { CodeInput, NumberInput, SelectInput, SwitchInput } from "../form/fields";
import {
  editorAsideClass,
  editorGridClass,
  fieldGridClass,
  FormSection,
} from "../form/form-section";
import { IconPicker } from "../form/icon-picker";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { MultiSelect } from "../form/multi-select";
import { ReadOnlyScope } from "../form/read-only";
import { Repeater } from "../form/repeater";
import { SaveBar } from "../form/save-bar";
import { SeoFields } from "../form/seo-fields";
import { MediaField } from "../media/media-field";
import { PanelCard } from "../panel-card";
import { PanelHeading } from "../panel-heading";
import { GalleryManager } from "./gallery-manager";
import { blankSpecItem, SpecGroupsEditor } from "./spec-groups-editor";

const copy = adminContent.products;
const { common, conflict, statuses } = adminContent;

interface ProductEditorProps {
  product: AdminProduct | null;
  categories: AdminOption[];
  brands: AdminOption[];
  guides: AdminOption[];
  products: AdminOption[];
  canWrite: boolean;
}

const toForm = (product: AdminProduct | null): ProductFormInput => ({
  slug: product?.slug ?? "",
  modelCode: product?.modelCode ?? "",
  categoryId: product?.categoryId ?? "",
  brandId: product?.brandId ?? "",
  status: product?.status ?? "draft",
  featured: product?.featured ?? false,
  isNew: product?.isNew ?? true,
  releaseYear: product ? product.releaseYear : new Date().getFullYear(),
  energyClass: product?.energyClass ?? null,
  name: product?.name ?? blankText(),
  tagline: product?.tagline ?? blankText(),
  summary: product?.summary ?? blankText(),
  description: product?.description ?? blankText(),
  specs: (product?.specs ?? []).map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      ...item,
      unit: item.unit ?? blankText(),
      unitCode: item.unitCode ?? "",
    })),
  })),
  keyFacts: product?.keyFacts ?? [],
  features: product?.features ?? [],
  downloads: product?.downloads ?? [],
  faqs: product?.faqs ?? [],
  guideId: product?.guideId ?? null,
  warrantyMonths: product?.warrantyMonths ?? 18,
  relatedIds: product?.relatedIds ?? [],
  seo: seoToForm(product?.seo ?? null),
  images: (product?.images ?? []).map((image) => ({
    mediaId: image.mediaId,
    alt: image.alt,
    isPrimary: image.isPrimary,
  })),
});

export function ProductEditor({
  product,
  categories,
  brands,
  guides,
  products,
  canWrite,
}: ProductEditorProps) {
  const router = useRouter();
  const { run, pending } = useAdminMutation();
  const { form, isDirty, isSubmitting, capture, commit, discard, rebase } = useEditorForm<
    ProductFormInput,
    ProductFormValues
  >({
    resolver: zodResolver(productFormSchema, zodOptions),
    defaultValues: toForm(product),
  });
  const { control, handleSubmit, getValues, setValue, setError } = form;
  const [version, setVersion] = useState(product?.updatedAt);
  const prefilled = useRef<string | null>(null);
  const [categoryId, nameEn] = useWatch({ control, name: ["categoryId", "name.en"] });
  const initialMedia = Object.fromEntries([
    ...(product?.images ?? []).map((image) => [image.mediaId, image.media] as const),
  ]);

  const prefillSpecs = useEffectEvent(async (id: string) => {
    const untouched = () => {
      const specs = getValues("specs");
      return specs.length === 0 || JSON.stringify(specs) === prefilled.current;
    };
    if (product || !untouched()) return;
    const { data } = await apiClient.api.admin.categories({ id }).get();
    if (!data || id !== getValues("categoryId") || !untouched()) return;
    setValue(
      "specs",
      data.specTemplate.map((group) => ({
        title: group.title,
        items: group.items.map((item) => ({
          ...blankSpecItem(),
          key: item.key,
          label: item.label,
          unit: item.unit ?? blankText(),
          unitCode: item.unitCode ?? "",
        })),
      })),
      { shouldDirty: true },
    );
    prefilled.current = JSON.stringify(getValues("specs"));
  });

  useEffect(() => {
    if (categoryId) void prefillSpecs(categoryId);
  }, [categoryId]);

  const applyServerErrors = (error: AdminApiError) => applyFieldErrors(setError, error);

  const reload = async () => {
    if (!product) return;
    const latest = await run(() => apiClient.api.admin.products({ id: product.id }).get(), {
      success: conflict.reloaded,
      description: conflict.reloadedHint,
      onSuccess: (data) => setVersion(data.updatedAt),
    });
    if (latest) rebase(toForm(latest));
  };

  const onSubmit = handleSubmit(async (values) => {
    const snapshot = capture();
    if (product) {
      const saved = await run(
        () =>
          apiClient.api.admin
            .products({ id: product.id })
            .patch({ ...values, expectedUpdatedAt: version }),
        {
          success: copy.savedToast,
          onSuccess: (data) => setVersion(data.updatedAt),
          onError: applyServerErrors,
          onStale: () => void reload(),
        },
      );
      if (saved) commit(snapshot, toForm(saved));
      return;
    }
    const created = await run(() => apiClient.api.admin.products.post(values), {
      success: copy.createdToast,
      refresh: false,
      onError: applyServerErrors,
    });
    if (!created) return;
    commit(snapshot);
    await leaveGuardedEntry();
    router.replace(adminRoutes.product(created.id) as Route);
  });

  const remove = async () => {
    if (!product) return;
    const done = await run(() => apiClient.api.admin.products({ id: product.id }).delete(), {
      success: common.deleted,
      refresh: false,
    });
    if (done) {
      commit(capture());
      await leaveGuardedEntry();
      router.replace(adminRoutes.products);
      router.refresh();
    }
  };

  const productOptions = toOptions(products, true);

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <PanelHeading
          eyebrow={copy.title}
          title={product ? product.name.fa : copy.createTitle}
          description={product ? undefined : copy.createDescription}
          action={
            product?.status === "published" && (
              <Link
                href={localizePath("fa", routes.product(product.slug))}
                target="_blank"
                className={buttonVariants({ variant: "line", size: "sm" })}
              >
                <ExternalLink className="size-4" aria-hidden />
                {common.viewOnSite}
              </Link>
            )
          }
        />
        <ReadOnlyScope readOnly={!canWrite}>
          <div className={editorGridClass}>
            <div className="flex min-w-0 flex-col gap-4">
              <FormSection
                step={1}
                title={copy.sections.basics}
                description={copy.sections.basicsHint}
                localized
              >
                <LocalizedField name="name" label={copy.fields.name} maxLength={120} />
                <div className={fieldGridClass}>
                  <CodeInput
                    name="modelCode"
                    label={copy.fields.modelCode}
                    placeholder="MC-4500"
                    hint={copy.fields.modelCodeHint}
                  />
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <CodeInput
                        name="slug"
                        label={common.slug}
                        placeholder="mc-4500"
                        hint={common.slugHint}
                      />
                    </div>
                    <Button
                      variant="soft"
                      size="icon-lg"
                      className="mt-[1.6875rem]"
                      aria-label={copy.fields.suggestSlug}
                      title={copy.fields.suggestSlug}
                      disabled={!canWrite}
                      onClick={() =>
                        setValue("slug", slugify(nameEn || getValues("modelCode")), {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    >
                      <Wand2 className="size-4" aria-hidden />
                    </Button>
                  </div>
                  <SelectInput
                    name="categoryId"
                    label={copy.fields.category}
                    options={toOptions(categories)}
                    placeholder={common.selectPlaceholder}
                    hint={product ? undefined : copy.fields.categoryHint}
                  />
                  <SelectInput
                    name="brandId"
                    label={copy.fields.brand}
                    options={toOptions(brands)}
                    placeholder={common.selectPlaceholder}
                  />
                </div>
              </FormSection>

              <FormSection
                step={2}
                title={copy.sections.story}
                description={copy.sections.storyHint}
                localized
              >
                <LocalizedField name="tagline" label={copy.fields.tagline} maxLength={200} />
                <LocalizedTextarea
                  name="summary"
                  label={copy.fields.summary}
                  maxLength={600}
                  rows={3}
                />
                <LocalizedField name="description" label={copy.fields.description} markdown />
              </FormSection>

              <FormSection
                step={3}
                title={copy.sections.gallery}
                description={copy.sections.galleryHint}
              >
                <GalleryManager name="images" initialMedia={initialMedia} />
              </FormSection>

              <FormSection
                step={4}
                title={copy.sections.keyFacts}
                description={copy.sections.keyFactsHint}
                localized
              >
                <Repeater
                  name="keyFacts"
                  addLabel={copy.addKeyFact}
                  emptyLabel={copy.emptyKeyFacts}
                  newItem={() => ({ label: blankText(), value: blankText() })}
                  max={12}
                  compact
                >
                  {(index) => (
                    <div className={fieldGridClass}>
                      <LocalizedField
                        name={`keyFacts.${index}.label`}
                        label={copy.fields.factLabel}
                      />
                      <LocalizedField
                        name={`keyFacts.${index}.value`}
                        label={copy.fields.factValue}
                      />
                    </div>
                  )}
                </Repeater>
              </FormSection>

              <FormSection
                step={5}
                title={copy.sections.features}
                description={copy.sections.featuresHint}
                localized
              >
                <Repeater
                  name="features"
                  addLabel={copy.addFeature}
                  emptyLabel={copy.emptyFeatures}
                  newItem={() => ({ icon: "sparkles", title: blankText(), body: blankText() })}
                  max={20}
                >
                  {(index) => (
                    <>
                      <IconPicker name={`features.${index}.icon`} label={copy.fields.icon} />
                      <LocalizedField
                        name={`features.${index}.title`}
                        label={common.title}
                        maxLength={80}
                      />
                      <LocalizedTextarea
                        name={`features.${index}.body`}
                        label={copy.fields.body}
                        maxLength={400}
                        rows={2}
                      />
                    </>
                  )}
                </Repeater>
              </FormSection>

              <FormSection
                step={6}
                title={copy.sections.specs}
                description={copy.sections.specsHint}
                localized
              >
                <SpecGroupsEditor name="specs" withValues />
              </FormSection>

              <FormSection
                step={7}
                title={copy.sections.downloads}
                description={copy.sections.downloadsHint}
                localized
              >
                <Repeater
                  name="downloads"
                  addLabel={copy.addDownload}
                  emptyLabel={copy.emptyDownloads}
                  newItem={() => ({ kind: "manual", title: blankText(), mediaId: "" })}
                  max={20}
                >
                  {(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
                      <div className="flex flex-col gap-4">
                        <SelectInput
                          name={`downloads.${index}.kind`}
                          label={copy.fields.downloadKind}
                          options={enumOptions(statuses.downloadKind)}
                        />
                        <LocalizedField name={`downloads.${index}.title`} label={common.title} />
                      </div>
                      <MediaField
                        name={`downloads.${index}.mediaId`}
                        label={copy.fields.file}
                        kind="document"
                        aspect="aspect-[3/2]"
                        initial={product?.media[getValues(`downloads.${index}.mediaId`)] ?? null}
                      />
                    </div>
                  )}
                </Repeater>
              </FormSection>

              <FormSection
                step={8}
                title={copy.sections.faqs}
                description={copy.sections.faqsHint}
                localized
              >
                <Repeater
                  name="faqs"
                  addLabel={copy.addFaq}
                  emptyLabel={copy.emptyFaqs}
                  newItem={() => ({ question: blankText(), answer: blankText() })}
                  max={30}
                >
                  {(index) => (
                    <>
                      <LocalizedField
                        name={`faqs.${index}.question`}
                        label={copy.fields.question}
                        maxLength={200}
                      />
                      <LocalizedTextarea
                        name={`faqs.${index}.answer`}
                        label={copy.fields.answer}
                        markdown
                        rows={3}
                      />
                    </>
                  )}
                </Repeater>
              </FormSection>

              <FormSection
                step={9}
                title={copy.sections.relations}
                description={copy.sections.relationsHint}
              >
                <SelectInput
                  name="guideId"
                  label={copy.fields.guide}
                  options={toOptions(guides)}
                  placeholder={copy.fields.guideDefault}
                  nullable
                />
                <MultiSelect
                  name="relatedIds"
                  label={copy.fields.related}
                  options={productOptions}
                  exclude={product?.id}
                  max={12}
                />
              </FormSection>

              <FormSection step={10} title={common.seo} description={common.seoHint} localized>
                <SeoFields />
              </FormSection>

              {canWrite && (
                <SaveBar
                  dirty={isDirty}
                  pending={isSubmitting || pending}
                  onDiscard={discard}
                  submitLabel={product ? common.saveChanges : copy.createSubmit}
                  isNew={!product}
                />
              )}
            </div>

            <aside className={editorAsideClass}>
              <PanelCard title={copy.sections.publishing}>
                <SelectInput
                  name="status"
                  label={common.status}
                  options={enumOptions(statuses.content)}
                />
                <SwitchInput
                  name="featured"
                  label={copy.fields.featured}
                  description={copy.fields.featuredHint}
                />
                <SwitchInput
                  name="isNew"
                  label={copy.fields.isNew}
                  description={copy.fields.isNewHint}
                />
              </PanelCard>
              <PanelCard title={copy.sections.specsMeta}>
                <div className="grid grid-cols-2 gap-3">
                  <NumberInput
                    name="releaseYear"
                    label={copy.fields.releaseYear}
                    placeholder="2025"
                  />
                  <NumberInput name="warrantyMonths" label={copy.fields.warrantyMonths} />
                </div>
                <SelectInput
                  name="energyClass"
                  label={copy.fields.energyClass}
                  options={energyClasses.map((value) => ({ value, label: value }))}
                  placeholder={copy.fields.energyNone}
                  nullable
                />
              </PanelCard>
              {product && (
                <PanelCard title={copy.sections.meta}>
                  <dl className="flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">{common.createdAt}</dt>
                      <dd className="font-bold text-ink">
                        {formatDateTime("fa", product.createdAt)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted">{common.updatedAt}</dt>
                      <dd className="font-bold text-ink">
                        {formatDateTime("fa", product.updatedAt)}
                      </dd>
                    </div>
                    {product.publishedAt && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted">{copy.publishedAt}</dt>
                        <dd className="font-bold text-ink">
                          {formatDateTime("fa", product.publishedAt)}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {canWrite && (
                    <ConfirmButton
                      label={`${common.delete} ${product.name.fa}`}
                      confirmLabel={copy.deleteConfirm}
                      onConfirm={() => void remove()}
                      className="h-10 w-full rounded-control border border-danger/30 text-sm text-danger"
                    >
                      <Trash className="size-4" aria-hidden />
                      {copy.delete}
                    </ConfirmButton>
                  )}
                </PanelCard>
              )}
            </aside>
          </div>
        </ReadOnlyScope>
      </form>
    </FormProvider>
  );
}
