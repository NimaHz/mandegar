"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/cn";
import { userInputSchema } from "@/server/modules/users/schema";
import { type AdminUser, userRoles } from "@/types/admin";

import { adminContent } from "../../content";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import { CodeInput, SwitchInput, TextInput } from "../form/fields";
import { FormSheet } from "../form/form-sheet";

const copy = adminContent.users;

const userFormSchema = userInputSchema.extend({ active: z.boolean() });

type UserFormInput = z.input<typeof userFormSchema>;
type UserFormValues = z.output<typeof userFormSchema>;

interface UserSheetProps {
  user: AdminUser | null;
  self: boolean;
  onClose: () => void;
  onCreated: (name: string, password: string) => void;
}

export function UserSheet({ user, self, onClose, onCreated }: UserSheetProps) {
  const { run, pending } = useAdminMutation();
  const form = useForm<UserFormInput, unknown, UserFormValues>({
    resolver: zodResolver(userFormSchema, zodOptions),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      role: user?.role ?? "editor",
      active: user?.active ?? true,
    },
  });

  const onSubmit = form.handleSubmit(async ({ name, email, role, active }) => {
    const onError = (error: Parameters<typeof applyFieldErrors>[1]) =>
      applyFieldErrors(form.setError, error);
    if (user) {
      const saved = await run(
        () =>
          apiClient.api.admin
            .users({ id: user.id })
            .patch(self ? { name } : { name, role, active }),
        { success: copy.saved, onError },
      );
      if (saved) {
        form.reset(form.getValues());
        onClose();
      }
      return;
    }
    const created = await run(() => apiClient.api.admin.users.post({ name, email, role }), {
      success: copy.created,
      onError,
    });
    if (created) {
      form.reset(form.getValues());
      onCreated(created.user.name, created.temporaryPassword);
    }
  });

  return (
    <FormSheet
      open
      onClose={onClose}
      title={user ? copy.sheetEdit : copy.sheetInvite}
      description={user?.email}
      form={form}
      onSubmit={onSubmit}
      pending={pending}
    >
      <TextInput name="name" label={copy.fields.name} autoComplete="off" />
      <CodeInput name="email" type="email" label={copy.fields.email} disabled={Boolean(user)} />
      <Controller
        control={form.control}
        name="role"
        render={({ field }) => (
          <fieldset className="flex flex-col gap-2" disabled={self}>
            <legend className="mb-1.5 text-label font-bold text-ink">{copy.fields.role}</legend>
            {userRoles.map((role) => (
              <label
                key={role}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-field border p-3 transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-60",
                  field.value === role
                    ? "border-primary bg-primary-soft/60"
                    : "border-line hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name={field.name}
                  value={role}
                  checked={field.value === role}
                  onChange={() => field.onChange(role)}
                  className="mt-1 accent-primary"
                />
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-extrabold text-ink">
                    {adminContent.roles[role]}
                  </span>
                  <span className="text-xs leading-5 text-muted">{copy.roleHints[role]}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
      />
      {user && !self && <SwitchInput name="active" label={copy.fields.active} />}
    </FormSheet>
  );
}
