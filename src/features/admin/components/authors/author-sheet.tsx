"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { apiClient } from "@/lib/api-client";
import type { AdminAuthor } from "@/types/admin";

import { adminContent } from "../../content";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import {
  type AuthorFormInput,
  authorFormSchema,
  type AuthorFormValues,
  blankText,
} from "../../schemas";
import { CodeInput } from "../form/fields";
import { FormSheet } from "../form/form-sheet";
import { LangScope } from "../form/lang-scope";
import { LocalizedField, LocalizedTextarea } from "../form/localized-field";
import { Repeater } from "../form/repeater";
import { SlugField } from "../form/slug-field";
import { MediaField } from "../media/media-field";

const copy = adminContent.authors;

interface AuthorSheetProps {
  author: AdminAuthor | null;
  onClose: () => void;
  readOnly: boolean;
}

export function AuthorSheet({ author, onClose, readOnly }: AuthorSheetProps) {
  const { run, pending } = useAdminMutation();
  const form = useForm<AuthorFormInput, unknown, AuthorFormValues>({
    resolver: zodResolver(authorFormSchema, zodOptions),
    defaultValues: {
      slug: author?.slug ?? "",
      name: author?.name ?? blankText(),
      role: author?.role ?? blankText(),
      bio: author?.bio ?? blankText(),
      avatarMediaId: author?.avatarMediaId ?? null,
      sameAs: (author?.sameAs ?? []).map((url) => ({ url })),
    },
  });

  const onSubmit = form.handleSubmit(async ({ sameAs, ...values }) => {
    const body = { ...values, sameAs: sameAs.map((entry) => entry.url) };
    const saved = await run(
      () =>
        author
          ? apiClient.api.admin.authors({ id: author.id }).patch(body)
          : apiClient.api.admin.authors.post(body),
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
      title={author ? copy.sheetEdit : copy.sheetCreate}
      description={author?.name.fa}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
      readOnly={readOnly}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
        <MediaField
          name="avatarMediaId"
          label={copy.fields.avatar}
          initial={author?.avatar ?? null}
          aspect="aspect-square"
        />
        <LangScope>
          <div className="flex flex-col gap-4">
            <LocalizedField name="name" label={copy.fields.name} maxLength={80} />
            <LocalizedField name="role" label={copy.fields.role} maxLength={80} />
          </div>
        </LangScope>
      </div>
      <SlugField source="name.en" />
      <LocalizedTextarea name="bio" label={copy.fields.bio} maxLength={2000} rows={4} />
      <div className="flex flex-col gap-2">
        <span className="text-label font-bold text-ink">{copy.fields.sameAs}</span>
        <p className="text-xs text-muted">{copy.fields.sameAsHint}</p>
        <Repeater
          name="sameAs"
          addLabel={copy.addLink}
          emptyLabel={copy.emptyLinks}
          newItem={() => ({ url: "" })}
          max={10}
          compact
        >
          {(index) => (
            <CodeInput
              name={`sameAs.${index}.url`}
              label={copy.fields.url}
              hideLabel
              placeholder="https://"
            />
          )}
        </Repeater>
      </div>
    </FormSheet>
  );
}
