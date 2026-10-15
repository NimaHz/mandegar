"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Printer, QrCode as QrIcon, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { z } from "zod";

import { CopyButton } from "@/components/shared/copy-button";
import { Button, buttonVariants } from "@/components/ui/button";
import { QrCode } from "@/components/ui/qr-code";
import { Sheet } from "@/components/ui/sheet";
import { fill } from "@/i18n/fill";
import { apiClient } from "@/lib/api-client";
import { currentJalaliYear } from "@/lib/dates";
import { adminRoutes } from "@/lib/routes";
import { warrantyGenerateSchema } from "@/server/modules/warranty/schema";
import type { AdminOption, AdminWarrantyCode } from "@/types/admin";

import { adminContent } from "../../content";
import { toOptions } from "../../lib/options";
import { applyFieldErrors } from "../../lib/server-errors";
import { useAdminMutation } from "../../lib/use-admin-mutation";
import { warrantyQrValue } from "../../lib/warranty";
import { zodOptions } from "../../lib/zod";
import { NumberInput, SelectInput, TextArea } from "../form/fields";

const copy = adminContent.warranty.generateSheet;

type GenerateInput = z.input<typeof warrantyGenerateSchema>;
type GenerateValues = z.output<typeof warrantyGenerateSchema>;

interface GenerateCodeSheetProps {
  open: boolean;
  onClose: () => void;
  products: AdminOption[];
  policies: AdminOption[];
}

export function GenerateCodeSheet({ open, onClose, products, policies }: GenerateCodeSheetProps) {
  const { run, pending } = useAdminMutation();
  const [result, setResult] = useState<AdminWarrantyCode | null>(null);
  const form = useForm<GenerateInput, unknown, GenerateValues>({
    resolver: zodResolver(warrantyGenerateSchema, zodOptions),
    defaultValues: {
      productId: "",
      productionYear: currentJalaliYear(),
      policyId: undefined,
      note: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const code = await run(() => apiClient.api.admin["warranty-codes"].generate.post(values), {
      success: copy.created,
      onError: (error) => applyFieldErrors(form.setError, error),
    });
    if (code) setResult(code);
  });

  const again = () => {
    setResult(null);
    form.reset({ ...form.getValues(), productId: "", note: "" });
  };

  const close = () => {
    onClose();
    if (result) again();
  };

  return (
    <Sheet open={open} onClose={close} title={result ? copy.resultTitle : copy.title}>
      {result ? (
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs font-bold text-muted">
              {result.product.name.fa} · <bdi dir="ltr">{result.product.modelCode}</bdi>
            </span>
            <span className="flex items-center gap-2">
              <bdi dir="ltr" className="font-code text-3xl font-bold tracking-[0.12em] text-ink">
                {result.formatted}
              </bdi>
              <CopyButton
                value={result.formatted}
                label={adminContent.warranty.copyCode}
                className="size-10"
              />
            </span>
          </div>
          <div className="rounded-panel border border-line bg-white p-3 shadow-card">
            <QrCode
              value={warrantyQrValue(result.code)}
              label={fill(copy.qr, { code: result.formatted })}
              className="size-44"
            />
          </div>
          <p className="max-w-sm text-xs leading-6 text-muted">{copy.resultHint}</p>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Link
              href={adminRoutes.labels([result.id])}
              className={buttonVariants({ className: "flex-1" })}
              target="_blank"
            >
              <Printer className="size-4" aria-hidden />
              {copy.print}
            </Link>
            <Button variant="soft" onClick={again} className="flex-1">
              <RotateCcw className="size-4" aria-hidden />
              {copy.another}
            </Button>
          </div>
        </div>
      ) : (
        <FormProvider {...form}>
          <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
            <p className="text-xs leading-6 text-muted">{copy.description}</p>
            <SelectInput
              name="productId"
              label={copy.product}
              options={toOptions(products, true)}
              placeholder={adminContent.common.selectPlaceholder}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <NumberInput name="productionYear" label={copy.year} hint={copy.yearHint} />
              <SelectInput
                name="policyId"
                label={copy.policy}
                options={toOptions(policies)}
                placeholder={copy.policyDefault}
                optional
              />
            </div>
            <TextArea name="note" label={copy.note} rows={2} className="min-h-20" />
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? (
                <LoaderCircle className="size-4.5 animate-spin" aria-hidden />
              ) : (
                <QrIcon className="size-4.5" aria-hidden />
              )}
              {copy.submit}
            </Button>
          </form>
        </FormProvider>
      )}
    </Sheet>
  );
}
