"use client";

import { ArrowLeft, KeyRound, LifeBuoy, Plus, Siren } from "lucide-react";
import Link from "next/link";

import { SuccessMark } from "@/components/motion/success-mark";
import { CopyButton } from "@/components/shared/copy-button";
import { buttonVariants } from "@/components/ui/button";
import { QrCode } from "@/components/ui/qr-code";
import { FocusHeading } from "@/features/warranty/components/focus-heading";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";
import { absoluteUrl } from "@/lib/seo/metadata";
import { formatTrackingCode } from "@/lib/tracking-code";
import type { TicketReceipt } from "@/types/support";

import type { RequestFlowContent } from "../../content";

interface ReceiptProps {
  locale: Locale;
  receipt: TicketReceipt;
  copy: RequestFlowContent["receipt"];
  onAnother: () => void;
}

export function Receipt({ locale, receipt, copy, onAnother }: ReceiptProps) {
  const trackPath = localizePath(locale, routes.track);
  const link = absoluteUrl(`${trackPath}?t=${encodeURIComponent(receipt.accessToken)}`);
  const code = formatTrackingCode(receipt.trackingCode);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <SuccessMark className="size-16" delay={0.1} />
        <FocusHeading
          id="request-receipt-title"
          className="font-display text-2xl font-black text-ink sm:text-3xl"
        >
          {copy.title}
        </FocusHeading>
        <p className="max-w-md text-sm leading-7 text-body">{copy.body}</p>
      </div>

      <div className="flex flex-col items-center gap-3 rounded-card bg-brand-deep px-5 py-6 text-white">
        <span className="text-caption font-bold text-white/70">{copy.codeLabel}</span>
        <div className="flex items-center gap-3">
          <bdi
            dir="ltr"
            className="font-code text-[1.625rem] font-black tracking-[0.12em] whitespace-nowrap text-accent sm:text-4xl sm:tracking-[0.18em]"
          >
            {code}
          </bdi>
          <CopyButton
            value={code}
            label={copy.codeLabel}
            className="size-10 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          />
        </div>
      </div>

      {receipt.urgent && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-card border border-danger/40 bg-danger-soft p-4"
        >
          <Siren className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
          <div className="flex flex-col gap-1">
            <p className="text-sm font-extrabold text-danger">{copy.urgentTitle}</p>
            <p className="text-sm leading-7 text-ink">{copy.urgentBody}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex flex-col gap-2.5 rounded-card border border-line bg-raised p-4">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-ink">
            <KeyRound className="size-4 text-primary" aria-hidden />
            {copy.linkLabel}
          </span>
          <div className="flex items-center gap-2 rounded-field border border-line bg-sunken p-1.5 ps-3">
            <bdi dir="ltr" className="min-w-0 flex-1 truncate font-code text-xs text-ink-soft">
              {link}
            </bdi>
            <CopyButton value={link} label={copy.linkLabel} className="size-9" />
          </div>
          <p className="text-xs leading-6 font-semibold text-warning">{copy.linkHint}</p>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-line bg-raised p-3 sm:flex-col sm:justify-center">
          <QrCode value={link} label={copy.qrLabel} className="size-28 shrink-0 rounded-md p-1" />
          <p className="max-w-40 text-caption leading-5 text-muted sm:text-center">{copy.qr}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-card bg-sunken p-4 sm:p-5">
        <h3 className="text-sm font-extrabold text-ink">{copy.nextTitle}</h3>
        <ol className="flex flex-col gap-2.5">
          {copy.next.map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-7 text-body">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-extrabold text-primary ring-1 ring-line">
                {formatNumber(locale, index + 1)}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <Link
          href={{ pathname: trackPath, query: { t: receipt.accessToken } }}
          className={buttonVariants({ className: "group max-sm:w-full" })}
        >
          {copy.track}
          <ArrowLeft
            className="size-4 transition-transform duration-300 group-hover:-translate-x-0.5 ltr:rotate-180 ltr:group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
        <button
          type="button"
          onClick={onAnother}
          className={buttonVariants({ variant: "line", className: "max-sm:flex-1" })}
        >
          <Plus className="size-4.5" aria-hidden />
          {copy.another}
        </button>
        <Link
          href={localizePath(locale, routes.support)}
          className={buttonVariants({ variant: "ghost", className: "max-sm:flex-1" })}
        >
          <LifeBuoy className="size-4.5" aria-hidden />
          {copy.support}
        </Link>
      </div>
    </div>
  );
}
