"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Trash } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { apiClient } from "@/lib/api-client";
import { adminRoutes } from "@/lib/routes";
import type { AdminGuide } from "@/types/admin";

import { adminContent } from "../../content";
import type { AdminApiError } from "../../lib/api-error";
import { clockValue, parseClock } from "../../lib/format";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type GuideFormInput,
  guideFormSchema,
  type GuideFormValues,
} from "../../schemas";
import { CodeInput, SelectInput, SwitchInput } from "../form/fields";
import {
  editorAsideClass,
  editorGridClass,
  fieldGridClass,
  FormSection,
} from "../form/form-section";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { ReadOnlyScope } from "../form/read-only";
import { Repeater } from "../form/repeater";
import { SaveBar } from "../form/save-bar";
import { SlugField } from "../form/slug-field";
import { MediaField } from "../media/media-field";
import { PanelCard } from "../panel-card";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.guides;
const { common } = adminContent;

interface GuideEditorProps {
  guide: AdminGuide | null;
  canWrite: boolean;
}

const toForm = (guide: AdminGuide | null): GuideFormInput => ({
  slug: guide?.slug ?? "",
  title: guide?.title ?? blankText(),
  summary: guide?.summary ?? blankText(),
  video: {
    kind: guide?.video?.kind ?? "none",
    mediaId: guide?.video?.kind === "upload" ? guide.video.mediaId : null,
    hash: guide?.video?.kind === "aparat" ? guide.video.hash : "",
    posterMediaId: guide?.video?.posterMediaId ?? null,
  },
  durationSec: guide?.durationSec ? clockValue(guide.durationSec) : "",
  steps: guide?.steps ?? [],
  tools: guide?.tools ?? [],
  safety: guide?.safety ?? [],
  chapters: (guide?.chapters ?? []).map((chapter) => ({
    title: chapter.title,
    startSec: clockValue(chapter.startSec),
  })),
  published: guide?.published ?? false,
});

const toBody = ({ video, durationSec, chapters, ...values }: GuideFormValues) => ({
  ...values,
  video:
    video.kind === "upload" && video.mediaId
      ? { kind: "upload" as const, mediaId: video.mediaId, posterMediaId: video.posterMediaId }
      : video.kind === "aparat" && video.hash
        ? { kind: "aparat" as const, hash: video.hash, posterMediaId: video.posterMediaId }
        : null,
  durationSec: durationSec ? parseClock(durationSec) : null,
  chapters: chapters.map((chapter) => ({
    title: chapter.title,
    startSec: parseClock(chapter.startSec) ?? 0,
  })),
});

function TextListSection({
  name,
  title,
  add,
  empty,
  label,
  max,
}: Record<"name" | "title" | "add" | "empty" | "label", string> & { max: number }) {
  return (
    <FormSection title={title} localized>
      <Repeater
        name={name}
        addLabel={add}
        emptyLabel={empty}
        newItem={() => ({ ...blankText() })}
        max={40}
        compact
      >
        {(index) => <LocalizedField name={`${name}.${index}`} label={label} maxLength={max} />}
      </Repeater>
    </FormSection>
  );
}

export function GuideEditor({ guide, canWrite }: GuideEditorProps) {
  const router = useRouter();
  const { run, pending } = useAdminMutation();
  const form = useForm<GuideFormInput, unknown, GuideFormValues>({
    resolver: zodResolver(guideFormSchema, zodOptions),
    defaultValues: toForm(guide),
  });
  const [version, setVersion] = useState(guide?.updatedAt);
  const kind = useWatch({ control: form.control, name: "video.kind" });
  const steps: unknown = useWatch({ control: form.control, name: "steps" });

  const onSubmit = form.handleSubmit(async (values) => {
    const snapshot = form.getValues();
    const body = toBody(values);
    const onError = (error: AdminApiError) => applyFieldErrors(form.setError, error);
    if (guide) {
      const saved = await run(
        () =>
          apiClient.api.admin
            .guides({ id: guide.id })
            .patch({ ...body, expectedUpdatedAt: version }),
        {
          success: copy.saved,
          onSuccess: (data) => setVersion(data.updatedAt),
          onError,
        },
      );
      if (saved) form.reset(snapshot);
      return;
    }
    const created = await run(() => apiClient.api.admin.guides.post(body), {
      success: copy.created,
      refresh: false,
      onError,
    });
    if (created) {
      form.reset(snapshot);
      router.replace(adminRoutes.guide(created.id) as Route);
    }
  });

  const remove = async () => {
    if (!guide) return;
    const done = await run(() => apiClient.api.admin.guides({ id: guide.id }).delete(), {
      success: common.deleted,
      refresh: false,
    });
    if (done) {
      form.reset(form.getValues());
      router.replace(adminRoutes.guides);
      router.refresh();
    }
  };

  const stepMedia = (index: number) => {
    const list = Array.isArray(steps) ? steps : [];
    const value: unknown = list[index];
    const id =
      typeof value === "object" && value !== null && "mediaId" in value ? value.mediaId : null;
    return typeof id === "string" ? (guide?.media[id] ?? null) : null;
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <PanelHeading eyebrow={copy.title} title={guide ? guide.title.fa : copy.createTitle} />
        <ReadOnlyScope readOnly={!canWrite}>
          <div className={editorGridClass}>
            <div className="flex min-w-0 flex-col gap-4">
              <FormSection step={1} title={copy.sections.basics} localized>
                <LocalizedField name="title" label={copy.fields.title} maxLength={160} />
                <SlugField source="title.en" />
                <LocalizedTextarea
                  name="summary"
                  label={copy.fields.summary}
                  maxLength={600}
                  rows={3}
                />
              </FormSection>

              <FormSection
                step={2}
                title={copy.sections.video}
                description={copy.sections.videoHint}
              >
                <div className={fieldGridClass}>
                  <SelectInput
                    name="video.kind"
                    label={copy.fields.videoKind}
                    options={(["none", "upload", "aparat"] as const).map((value) => ({
                      value,
                      label: copy.videoKinds[value],
                    }))}
                  />
                  <CodeInput
                    name="durationSec"
                    label={copy.fields.duration}
                    placeholder="04:30"
                    hint={copy.fields.durationHint}
                  />
                </div>
                {kind === "aparat" && (
                  <CodeInput
                    name="video.hash"
                    label={copy.fields.aparat}
                    hint={copy.fields.aparatHint}
                    placeholder="aBcD1"
                  />
                )}
                {kind !== "none" && (
                  <div className={fieldGridClass}>
                    {kind === "upload" && (
                      <MediaField
                        name="video.mediaId"
                        label={copy.fields.video}
                        kind="video"
                        aspect="aspect-video"
                        initial={
                          guide?.video?.kind === "upload"
                            ? (guide.media[guide.video.mediaId] ?? null)
                            : null
                        }
                      />
                    )}
                    <MediaField
                      name="video.posterMediaId"
                      label={copy.fields.poster}
                      aspect="aspect-video"
                      initial={
                        guide?.video?.posterMediaId
                          ? (guide.media[guide.video.posterMediaId] ?? null)
                          : null
                      }
                    />
                  </div>
                )}
              </FormSection>

              <FormSection
                step={3}
                title={copy.sections.steps}
                description={copy.sections.stepsHint}
                localized
              >
                <Repeater
                  name="steps"
                  addLabel={copy.addStep}
                  emptyLabel={copy.emptySteps}
                  newItem={() => ({ title: blankText(), body: blankText(), mediaId: null })}
                  max={60}
                >
                  {(index) => (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_13rem]">
                      <div className="flex flex-col gap-4">
                        <LocalizedField
                          name={`steps.${index}.title`}
                          label={copy.fields.stepTitle}
                          maxLength={160}
                        />
                        <LocalizedTextarea
                          name={`steps.${index}.body`}
                          label={copy.fields.stepBody}
                          maxLength={3000}
                          rows={3}
                        />
                      </div>
                      <MediaField
                        name={`steps.${index}.mediaId`}
                        label={copy.fields.stepImage}
                        initial={stepMedia(index)}
                      />
                    </div>
                  )}
                </Repeater>
              </FormSection>

              <TextListSection
                name="tools"
                title={copy.sections.tools}
                add={copy.addTool}
                empty={copy.emptyTools}
                label={copy.fields.tool}
                max={120}
              />
              <TextListSection
                name="safety"
                title={copy.sections.safety}
                add={copy.addSafety}
                empty={copy.emptySafety}
                label={copy.fields.safety}
                max={400}
              />

              <FormSection
                title={copy.sections.chapters}
                description={copy.sections.chaptersHint}
                localized
              >
                <Repeater
                  name="chapters"
                  addLabel={copy.addChapter}
                  emptyLabel={copy.emptyChapters}
                  newItem={() => ({ title: blankText(), startSec: "00:00" })}
                  max={60}
                  compact
                >
                  {(index) => (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
                      <LocalizedField
                        name={`chapters.${index}.title`}
                        label={copy.fields.chapterTitle}
                        maxLength={120}
                      />
                      <CodeInput
                        name={`chapters.${index}.startSec`}
                        label={copy.fields.chapterStart}
                        placeholder="01:30"
                      />
                    </div>
                  )}
                </Repeater>
              </FormSection>

              {canWrite && (
                <SaveBar
                  dirty={form.formState.isDirty}
                  pending={pending}
                  onDiscard={() => form.reset()}
                  submitLabel={guide ? common.saveChanges : common.create}
                  isNew={!guide}
                />
              )}
            </div>
            <aside className={editorAsideClass}>
              <PanelCard title={copy.sections.publishing}>
                <SwitchInput
                  name="published"
                  label={copy.fields.published}
                  description={copy.fields.publishedHint}
                />
              </PanelCard>
              {guide && canWrite && (
                <ConfirmButton
                  label={`${common.delete} ${guide.title.fa}`}
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
