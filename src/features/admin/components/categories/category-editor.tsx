"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider } from "react-hook-form";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { apiClient } from "@/lib/api-client";
import { adminRoutes } from "@/lib/routes";
import type { AdminCategory, AdminOption } from "@/types/admin";

import { adminContent } from "../../content";
import { toOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { useEditorForm } from "../../lib/use-editor-form";
import { leaveGuardedEntry } from "../../lib/use-unsaved-guard";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type CategoryFormInput,
  categoryFormSchema,
  type CategoryFormValues,
  seoToForm,
} from "../../schemas";
import { NumberInput, SelectInput, SwitchInput } from "../form/fields";
import { editorAsideClass, editorGridClass, FormSection } from "../form/form-section";
import { categoryIcons, IconPicker } from "../form/icon-picker";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { ReadOnlyScope } from "../form/read-only";
import { SaveBar } from "../form/save-bar";
import { SeoFields } from "../form/seo-fields";
import { SlugField } from "../form/slug-field";
import { MediaField } from "../media/media-field";
import { PanelCard } from "../panel-card";
import { PanelHeading } from "../panel-heading";
import { SpecGroupsEditor } from "../products/spec-groups-editor";

const copy = adminContent.categories;
const { common, conflict } = adminContent;

interface CategoryEditorProps {
  category: AdminCategory | null;
  categories: AdminOption[];
  guides: AdminOption[];
  canWrite: boolean;
}

const toForm = (category: AdminCategory | null): CategoryFormInput => ({
  slug: category?.slug ?? "",
  parentId: category?.parentId ?? null,
  name: category?.name ?? blankText(),
  summary: category?.summary ?? blankText(),
  description: category?.description ?? blankText(),
  icon: category?.icon ?? "fan",
  imageMediaId: category?.imageMediaId ?? null,
  defaultGuideId: category?.defaultGuideId ?? null,
  specTemplate: (category?.specTemplate ?? []).map((group) => ({
    title: group.title,
    items: group.items.map((item) => ({
      ...item,
      unit: item.unit ?? blankText(),
      unitCode: item.unitCode ?? "",
    })),
  })),
  seo: seoToForm(category?.seo ?? null),
  sortOrder: category?.sortOrder ?? 0,
  published: category?.published ?? true,
});

export function CategoryEditor({ category, categories, guides, canWrite }: CategoryEditorProps) {
  const router = useRouter();
  const { run, pending } = useAdminMutation();
  const { form, isDirty, capture, commit, discard, rebase } = useEditorForm<
    CategoryFormInput,
    CategoryFormValues
  >({
    resolver: zodResolver(categoryFormSchema, zodOptions),
    defaultValues: toForm(category),
  });
  const [version, setVersion] = useState(category?.updatedAt);
  const hasChildren =
    Boolean(category) && categories.some((option) => option.hint === category?.slug);
  const parentOptions = hasChildren
    ? []
    : toOptions(categories.filter((option) => option.id !== category?.id && !option.hint));

  const reload = async () => {
    if (!category) return;
    const latest = await run(() => apiClient.api.admin.categories({ id: category.id }).get(), {
      success: conflict.reloaded,
      description: conflict.reloadedHint,
      onSuccess: (data) => setVersion(data.updatedAt),
    });
    if (latest) rebase(toForm(latest));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    const snapshot = capture();
    const onError = (error: Parameters<typeof applyFieldErrors>[1]) =>
      applyFieldErrors(form.setError, error);
    if (category) {
      const saved = await run(
        () =>
          apiClient.api.admin
            .categories({ id: category.id })
            .patch({ ...values, expectedUpdatedAt: version }),
        {
          success: copy.saved,
          onSuccess: (data) => setVersion(data.updatedAt),
          onError,
          onStale: () => void reload(),
        },
      );
      if (saved) commit(snapshot, toForm(saved));
      return;
    }
    const created = await run(() => apiClient.api.admin.categories.post(values), {
      success: copy.created,
      refresh: false,
      onError,
    });
    if (created) {
      commit(snapshot);
      await leaveGuardedEntry();
      router.replace(adminRoutes.category(created.id) as Route);
    }
  });

  const remove = async () => {
    if (!category) return;
    const done = await run(() => apiClient.api.admin.categories({ id: category.id }).delete(), {
      success: common.deleted,
      refresh: false,
    });
    if (done) {
      commit(capture());
      await leaveGuardedEntry();
      router.replace(adminRoutes.categories);
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <PanelHeading eyebrow={copy.title} title={category ? category.name.fa : copy.createTitle} />
        <ReadOnlyScope readOnly={!canWrite}>
          <div className={editorGridClass}>
            <div className="flex min-w-0 flex-col gap-4">
              <FormSection
                step={1}
                title={copy.sections.basics}
                description={copy.sections.basicsHint}
                localized
              >
                <LocalizedField name="name" label={copy.fields.name} maxLength={80} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <SlugField source="name.en" />
                  <SelectInput
                    name="parentId"
                    label={copy.fields.parent}
                    options={parentOptions}
                    placeholder={copy.fields.noParent}
                    hint={hasChildren ? copy.fields.parentLocked : undefined}
                    disabled={hasChildren}
                    nullable
                  />
                </div>
                <IconPicker name="icon" label={copy.fields.icon} set={categoryIcons} />
              </FormSection>
              <FormSection
                step={2}
                title={copy.sections.story}
                description={copy.sections.storyHint}
                localized
              >
                <LocalizedTextarea
                  name="summary"
                  label={copy.fields.summary}
                  maxLength={300}
                  rows={2}
                />
                <LocalizedField
                  name="description"
                  label={copy.fields.description}
                  markdown
                  rows={6}
                />
              </FormSection>
              <FormSection
                step={3}
                title={copy.sections.template}
                description={copy.sections.templateHint}
                localized
              >
                <SpecGroupsEditor name="specTemplate" />
              </FormSection>
              <FormSection step={4} title={common.seo} description={common.seoHint} localized>
                <SeoFields />
              </FormSection>
              {canWrite && (
                <SaveBar
                  dirty={isDirty}
                  pending={pending}
                  onDiscard={discard}
                  submitLabel={category ? common.saveChanges : common.create}
                  isNew={!category}
                />
              )}
            </div>
            <aside className={editorAsideClass}>
              <PanelCard title={copy.sections.image}>
                <MediaField
                  name="imageMediaId"
                  label={copy.fields.image}
                  initial={category?.image ?? null}
                />
                <NumberInput name="sortOrder" label={copy.fields.sortOrder} />
                <SwitchInput name="published" label={copy.fields.published} />
              </PanelCard>
              <PanelCard title={copy.sections.guide} description={copy.sections.guideHint}>
                <SelectInput
                  name="defaultGuideId"
                  label={copy.fields.guide}
                  hideLabel
                  options={toOptions(guides)}
                  placeholder={copy.fields.noGuide}
                  nullable
                />
              </PanelCard>
              {category && canWrite && (
                <ConfirmButton
                  label={`${common.delete} ${category.name.fa}`}
                  confirmLabel={adminContent.products.deleteConfirm}
                  onConfirm={() => void remove()}
                  className="h-10 w-full rounded-control border border-danger/30 text-sm text-danger"
                >
                  <Trash className="size-4" aria-hidden />
                  {copy.delete}
                </ConfirmButton>
              )}
            </aside>
          </div>
        </ReadOnlyScope>
      </form>
    </FormProvider>
  );
}
