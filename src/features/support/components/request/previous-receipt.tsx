"use client";

import { History, X } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { useDictionary } from "@/i18n/locale-provider";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import { formatTrackingCode } from "@/lib/tracking-code";
import type { TicketReceipt } from "@/types/support";

import type { RequestFlowContent } from "../../content";

interface PreviousReceiptProps {
  locale: Locale;
  receipt: TicketReceipt;
  copy: RequestFlowContent["receipt"];
  onDismiss: () => void;
}

export function PreviousReceipt({ locale, receipt, copy, onDismiss }: PreviousReceiptProps) {
  const { common } = useDictionary();
  const [before, after = ""] = copy.previous.split("{code}");

  return (
    <div className="flex items-start gap-3 rounded-field border border-primary/25 bg-primary-soft/50 p-3.5">
      <History className="mt-1 size-4.5 shrink-0 text-primary" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-1 text-sm leading-7 text-ink">
        <p>
          {before}
          <bdi dir="ltr" className="font-code font-bold tracking-wider">
            {formatTrackingCode(receipt.trackingCode)}
          </bdi>
          {after}
        </p>
        <Link
          href={{ pathname: localizePath(locale, routes.track), query: { t: receipt.accessToken } }}
          className="font-bold text-primary underline underline-offset-4"
        >
          {copy.track}
        </Link>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label={common.close}
        className="icon-btn size-8 shrink-0"
      >
        <X className="size-4" aria-hidden />
      </button>
    </div>
  );
}
