"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LoaderCircle } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { apiClient } from "@/lib/api-client";
import { adminRoutes } from "@/lib/routes";

import { adminContent } from "../../content";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { zodOptions } from "../../lib/zod";
import { PanelCard } from "../panel-card";

const copy = adminContent.account.password;

const schema = z
  .object({
    currentPassword: z.string().min(1).max(200),
    newPassword: z
      .string()
      .min(12, copy.weak)
      .max(200)
      .refine((value) => /[a-z]/i.test(value) && /\d/.test(value), copy.weak),
    confirm: z.string(),
  })
  .refine((value) => value.newPassword === value.confirm, {
    path: ["confirm"],
    message: adminContent.validation.mismatch,
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    path: ["newPassword"],
    message: copy.same,
  });

type PasswordValues = z.infer<typeof schema>;

export function PasswordCard({ mustChange }: { mustChange: boolean }) {
  const router = useRouter();
  const { run, pending } = useAdminMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(schema, zodOptions),
    defaultValues: { currentPassword: "", newPassword: "", confirm: "" },
  });

  const onSubmit = handleSubmit(async ({ currentPassword, newPassword }) => {
    const done = await run(
      () => apiClient.api.auth.password.post({ currentPassword, newPassword }),
      {
        success: copy.changed,
        refresh: !mustChange,
      },
    );
    if (!done) return;
    reset();
    if (mustChange) {
      router.replace(adminRoutes.dashboard as Route);
      router.refresh();
    }
  });

  return (
    <PanelCard title={copy.title} icon={KeyRound} description={copy.hint}>
      <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
        <input type="text" autoComplete="username" hidden readOnly />
        <Field
          label={copy.current}
          type="password"
          dir="ltr"
          autoComplete="current-password"
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label={copy.next}
            type="password"
            dir="ltr"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <Field
            label={copy.confirm}
            type="password"
            dir="ltr"
            autoComplete="new-password"
            error={errors.confirm?.message}
            {...register("confirm")}
          />
        </div>
        <Button type="submit" disabled={pending} className="self-start">
          {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden />}
          {copy.submit}
        </Button>
      </form>
    </PanelCard>
  );
}
