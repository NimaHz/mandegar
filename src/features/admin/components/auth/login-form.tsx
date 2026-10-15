"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Undo2,
} from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { toLatinDigits } from "@/lib/persian";
import { adminRoutes } from "@/lib/routes";
import { loginSchema } from "@/server/modules/auth/schema";

import { adminContent } from "../../content";
import { type AdminApiError, toApiError } from "../../lib/api-error";
import { zodOptions } from "../../lib/zod";

const copy = adminContent.login;

type LoginInput = z.input<typeof loginSchema>;
type LoginValues = z.output<typeof loginSchema>;

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [needsTotp, setNeedsTotp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [failure, setFailure] = useState<AdminApiError | null>(null);
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput, unknown, LoginValues>({
    resolver: zodResolver(loginSchema, zodOptions),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null);
    const result = await apiClient.api.auth.login.post(values).catch(() => null);
    if (!result || result.error) {
      setFailure(
        toApiError(
          result?.error ?? null,
          result?.headers instanceof Headers ? result.headers.get("retry-after") : null,
        ),
      );
      if (needsTotp) setValue("totp", "");
      return;
    }
    if (result.data.status === "totp-required") {
      setNeedsTotp(true);
      window.setTimeout(() => setFocus("totp"), 50);
      return;
    }
    toast({ title: fill(copy.welcome, { name: result.data.user.name }), tone: "success" });
    router.replace((result.data.user.mustChangePassword ? adminRoutes.account : next) as Route);
    router.refresh();
  });

  const restart = () => {
    setNeedsTotp(false);
    setFailure(null);
    setValue("totp", undefined);
    setValue("password", "");
  };

  const rateLimited = failure?.code === "RATE_LIMITED";

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      {failure && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-field border border-danger/25 bg-danger-soft px-3.5 py-3 text-danger"
        >
          <CircleAlert className="mt-0.5 size-4.5 shrink-0" aria-hidden />
          <span className="flex flex-col gap-0.5">
            <span className="text-label font-extrabold">
              {rateLimited ? copy.rateLimitedTitle : copy.invalidTitle}
            </span>
            <span className="text-xs leading-6">{failure.message}</span>
          </span>
        </div>
      )}
      {needsTotp ? (
        <>
          <div className="flex items-start gap-3 rounded-field bg-primary-soft/70 p-3.5">
            <span className="icon-tile size-9 bg-surface">
              <KeyRound className="size-4.5" aria-hidden />
            </span>
            <span className="flex flex-col gap-0.5">
              <span className="text-label font-extrabold text-ink">{copy.totpTitle}</span>
              <span className="text-xs leading-6 text-body">{copy.totpDescription}</span>
            </span>
          </div>
          <Field
            label={copy.totp}
            hint={copy.totpHint}
            inputMode="numeric"
            autoComplete="one-time-code"
            dir="ltr"
            maxLength={6}
            placeholder="••••••"
            error={errors.totp?.message}
            className="text-center font-code text-xl tracking-[0.6em]"
            {...register("totp", {
              setValueAs: (value: unknown) =>
                typeof value === "string"
                  ? toLatinDigits(value).replace(/\D/g, "") || undefined
                  : undefined,
            })}
          />
        </>
      ) : (
        <>
          <Field
            label={copy.email}
            type="email"
            icon={Mail}
            dir="ltr"
            autoComplete="username"
            autoFocus
            error={errors.email?.message}
            className="text-start"
            {...register("email")}
          />
          <div className="relative">
            <Field
              label={copy.password}
              type={showPassword ? "text" : "password"}
              icon={LockKeyhole}
              dir="ltr"
              autoComplete="current-password"
              error={errors.password?.message}
              className="pe-12 text-start"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? copy.hidePassword : copy.showPassword}
              aria-pressed={showPassword}
              className="absolute end-1.5 top-[1.875rem] icon-btn size-9"
            >
              {showPassword ? (
                <EyeOff className="size-4.5" aria-hidden />
              ) : (
                <Eye className="size-4.5" aria-hidden />
              )}
            </button>
          </div>
        </>
      )}
      <Button type="submit" size="lg" block disabled={isSubmitting} className="mt-1">
        {isSubmitting && <LoaderCircle className="size-4.5 animate-spin" aria-hidden />}
        {isSubmitting ? copy.submitting : needsTotp ? copy.verify : copy.submit}
      </Button>
      {needsTotp && (
        <Button variant="ghost" size="sm" onClick={restart} className="self-center">
          <Undo2 className="size-4" aria-hidden />
          {copy.back}
        </Button>
      )}
    </form>
  );
}
