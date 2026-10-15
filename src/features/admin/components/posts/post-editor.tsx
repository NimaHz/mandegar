"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Trash } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { buttonVariants } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { localizePath } from "@/i18n/paths";
import { apiClient } from "@/lib/api-client";
import { adminRoutes, routes } from "@/lib/routes";
import type { AdminOption, AdminPost } from "@/types/admin";

import { adminContent } from "../../content";
import type { AdminApiError } from "../../lib/api-error";
import { fromLocalInput, toLocalInput } from "../../lib/datetime";
import { enumOptions, toOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  blankText,
  type PostFormInput,
  postFormSchema,
  type PostFormValues,
  seoToForm,
} from "../../schemas";
import { DateTimeInput, SelectInput } from "../form/fields";
import { editorAsideClass, editorGridClass, FormSection } from "../form/form-section";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { MultiSelect } from "../form/multi-select";
import { SaveBar } from "../form/save-bar";
import { SeoFields } from "../form/seo-fields";
import { SlugField } from "../form/slug-field";
import { MediaField } from "../media/media-field";
import { PanelCard } from "../panel-card";
import { PanelHeading } from "../panel-heading";

const copy = adminContent.posts;
const { common, statuses } = adminContent;

interface PostEditorProps {
  post: AdminPost | null;
  authors: AdminOption[];
  products: AdminOption[];
  canWrite: boolean;
}

const toForm = (post: AdminPost | null, authorId: string): PostFormInput => ({
  slug: post?.slug ?? "",
  kind: post?.kind ?? "tips",
  title: post?.title ?? blankText(),
  excerpt: post?.excerpt ?? blankText(),
  body: post?.body ?? blankText(),
  coverMediaId: post?.coverMediaId ?? null,
  authorId: post?.authorId ?? authorId,
  relatedProductIds: post?.relatedProductIds ?? [],
  status: post?.status ?? "draft",
  seo: seoToForm(post?.seo ?? null),
  publishedAt: toLocalInput(post?.publishedAt ?? null),
});

export function PostEditor({ post, authors, products, canWrite }: PostEditorProps) {
  const router = useRouter();
  const { run, pending } = useAdminMutation();
  const form = useForm<PostFormInput, unknown, PostFormValues>({
    resolver: zodResolver(postFormSchema, zodOptions),
    defaultValues: toForm(post, authors[0]?.id ?? ""),
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const snapshot = form.getValues();
    const body = { ...values, publishedAt: fromLocalInput(values.publishedAt) };
    const onError = (error: AdminApiError) => applyFieldErrors(form.setError, error);
    if (post) {
      const saved = await run(() => apiClient.api.admin.posts({ id: post.id }).patch(body), {
        success: copy.saved,
        onError,
      });
      if (saved) form.reset(snapshot);
      return;
    }
    const created = await run(() => apiClient.api.admin.posts.post(body), {
      success: copy.created,
      refresh: false,
      onError,
    });
    if (created) {
      form.reset(snapshot);
      router.replace(adminRoutes.post(created.id) as Route);
    }
  });

  const remove = async () => {
    if (!post) return;
    const done = await run(() => apiClient.api.admin.posts({ id: post.id }).delete(), {
      success: common.deleted,
      refresh: false,
    });
    if (done) {
      form.reset(form.getValues());
      router.replace(adminRoutes.posts);
      router.refresh();
    }
  };

  return (
    <FormProvider {...form}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-5">
        <PanelHeading
          eyebrow={copy.title}
          title={post ? post.title.fa : copy.createTitle}
          action={
            post?.status === "published" && (
              <Link
                href={localizePath("fa", routes.post(post.slug))}
                target="_blank"
                className={buttonVariants({ variant: "line", size: "sm" })}
              >
                <ExternalLink className="size-4" aria-hidden />
                {common.viewOnSite}
              </Link>
            )
          }
        />
        <fieldset disabled={!canWrite} className="contents">
          <div className={editorGridClass}>
            <div className="flex min-w-0 flex-col gap-4">
              <FormSection step={1} title={copy.sections.basics} localized>
                <LocalizedField name="title" label={copy.fields.title} maxLength={160} />
                <SlugField source="title.en" />
                <LocalizedTextarea
                  name="excerpt"
                  label={copy.fields.excerpt}
                  maxLength={400}
                  rows={3}
                />
              </FormSection>
              <FormSection step={2} title={copy.sections.body} localized>
                <LocalizedField name="body" label={copy.fields.body} markdown rows={18} />
              </FormSection>
              <FormSection step={3} title={copy.sections.related}>
                <MultiSelect
                  name="relatedProductIds"
                  label={copy.fields.related}
                  options={toOptions(products, true)}
                  max={12}
                />
              </FormSection>
              <FormSection step={4} title={common.seo} description={common.seoHint} localized>
                <SeoFields />
              </FormSection>
              {canWrite && (
                <SaveBar
                  dirty={form.formState.isDirty}
                  pending={pending}
                  onDiscard={() => form.reset()}
                  submitLabel={post ? common.saveChanges : common.create}
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
                <SelectInput
                  name="kind"
                  label={copy.fields.kind}
                  options={enumOptions(statuses.postKind)}
                />
                <SelectInput
                  name="authorId"
                  label={copy.fields.author}
                  options={toOptions(authors)}
                  placeholder={common.selectPlaceholder}
                />
                <DateTimeInput
                  name="publishedAt"
                  label={copy.fields.publishedAt}
                  hint={copy.fields.publishedAtHint}
                />
              </PanelCard>
              <PanelCard title={copy.sections.cover}>
                <MediaField
                  name="coverMediaId"
                  label={copy.fields.cover}
                  initial={post?.cover ?? null}
                  aspect="aspect-video"
                />
              </PanelCard>
              {post && canWrite && (
                <ConfirmButton
                  label={`${common.delete} ${post.title.fa}`}
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
        </fieldset>
      </form>
    </FormProvider>
  );
}
