"use client";

import { PencilLine } from "lucide-react";
import Link from "next/link";
import type { ReactNode, RefObject } from "react";
import { useFormContext } from "react-hook-form";

import { AltchaWidget } from "@/components/shared/altcha-widget";
import type { AltchaState } from "@/components/shared/use-altcha";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { formatDate } from "@/lib/dates";
import { formatList } from "@/lib/format";
import { normalizeMobile } from "@/lib/persian";
import { provinceName } from "@/lib/provinces";
import { routes } from "@/lib/routes";
import { attachmentKey } from "@/lib/tickets";
import { formatWarrantyCode } from "@/lib/warranty-code";
import type { ModelOption } from "@/types/catalog";

import type { RequestStep } from "../../constants";
import type { RequestFlowContent } from "../../content";
import type { RequestValues } from "../../schemas";

interface ReviewStepProps {
  locale: Locale;
  copy: RequestFlowContent;
  typeLabels: Record<string, string>;
  models: ModelOption[];
  files: File[];
  altcha: AltchaState;
  honeypotRef: RefObject<HTMLInputElement | null>;
  onEdit: (step: RequestStep) => void;
}

interface SummaryRow {
  label: string;
  value: ReactNode;
}

function SummaryGroup({
  title,
  rows,
  editLabel,
  onEdit,
}: {
  title: string;
  rows: SummaryRow[];
  editLabel: string;
  onEdit: () => void;
}) {
  return (
    <section className="rounded-card border border-line bg-raised">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <h3 className="text-sm font-extrabold text-ink">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          aria-label={`${editLabel}: ${title}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-control px-2.5 text-xs font-bold text-primary transition-colors hover:bg-primary-soft"
        >
          <PencilLine className="size-3.5" aria-hidden />
          {editLabel}
        </button>
      </header>
      <dl className="divide-y divide-line">
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid grid-cols-1 gap-1 px-4 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="text-caption font-semibold text-muted sm:text-xs">{row.label}</dt>
            <dd className="text-sm font-semibold break-words text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ReviewStep({
  locale,
  copy,
  typeLabels,
  models,
  files,
  altcha,
  honeypotRef,
  onEdit,
}: ReviewStepProps) {
  const { getValues } = useFormContext<RequestValues>();
  const values = getValues();
  const empty = <span className="font-normal text-muted">{copy.review.empty}</span>;
  const model = models.find((entry) => entry.slug === values.productSlug);
  const mobile = normalizeMobile(values.phone) ?? values.phone;
  const [before, after = ""] = copy.review.consent.split("{privacy}");

  return (
    <div className="flex flex-col gap-4">
      <SummaryGroup
        title={copy.steps.type.label}
        editLabel={copy.nav.edit}
        onEdit={() => onEdit("type")}
        rows={[{ label: copy.steps.type.label, value: typeLabels[values.type] ?? empty }]}
      />
      <SummaryGroup
        title={copy.steps.product.label}
        editLabel={copy.nav.edit}
        onEdit={() => onEdit("product")}
        rows={[
          {
            label: copy.product.code.label,
            value: values.warrantyCode ? (
              <bdi dir="ltr" className="font-code tracking-wider">
                {formatWarrantyCode(values.warrantyCode)}
              </bdi>
            ) : (
              empty
            ),
          },
          ...(values.warrantyCode && !values.productSlug
            ? []
            : [
                {
                  label: copy.product.model,
                  value: model ? (
                    <>
                      {model.name}{" "}
                      <bdi dir="ltr" className="font-code text-xs text-muted">
                        {model.modelCode}
                      </bdi>
                    </>
                  ) : (
                    empty
                  ),
                },
              ]),
          {
            label: copy.product.purchaseDate,
            value: values.purchaseDate ? formatDate(locale, values.purchaseDate) : empty,
          },
        ]}
      />
      <SummaryGroup
        title={copy.steps.details.label}
        editLabel={copy.nav.edit}
        onEdit={() => onEdit("details")}
        rows={[
          { label: copy.details.subject, value: values.subject },
          {
            label: copy.details.description,
            value: (
              <span className="line-clamp-4 font-normal whitespace-pre-line text-body">
                {values.description}
              </span>
            ),
          },
          {
            label: copy.attachments.label,
            value:
              files.length > 0 ? (
                <span className="flex flex-col gap-0.5 font-normal">
                  {files.map((file) => (
                    <span key={attachmentKey(file)} className="truncate" dir="auto">
                      {file.name}
                    </span>
                  ))}
                </span>
              ) : (
                empty
              ),
          },
        ]}
      />
      <SummaryGroup
        title={copy.steps.contact.label}
        editLabel={copy.nav.edit}
        onEdit={() => onEdit("contact")}
        rows={[
          { label: copy.contact.name, value: values.name },
          {
            label: copy.contact.phone,
            value: (
              <bdi dir="ltr" className="font-code">
                {mobile}
              </bdi>
            ),
          },
          {
            label: copy.contact.email,
            value: values.email ? <bdi dir="ltr">{values.email}</bdi> : empty,
          },
          {
            label: copy.contact.province,
            value: formatList(locale, [provinceName(locale, values.province), values.city]),
          },
          { label: copy.contact.address, value: values.address },
        ]}
      />

      <p className="text-xs leading-6 text-muted">
        {before}
        <Link
          href={localizePath(locale, routes.privacy)}
          target="_blank"
          className="font-semibold text-primary underline underline-offset-4"
        >
          {copy.review.privacy}
        </Link>
        {after}
      </p>

      <AltchaWidget state={altcha} />

      <div aria-hidden className="sr-only">
        <label>
          {copy.review.honeypot}
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </div>
  );
}
