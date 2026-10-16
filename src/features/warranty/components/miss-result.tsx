import { Clock, CloudOff, MessageCircle, RotateCw, SearchX, Wrench } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";

import type { WarrantyContent } from "../content";
import { FocusHeading } from "./focus-heading";

interface MissResultProps {
  locale: Locale;
  content: WarrantyContent;
  headingId: string;
}

export function NotFoundResult({ locale, content, headingId }: MissResultProps) {
  const { notFound } = content;

  return (
    <article aria-labelledby={headingId} className="panel bg-raised p-5 shadow-card sm:p-7">
      <div className="flex items-start gap-4">
        <span className="icon-tile size-12 rounded-field bg-chip text-ink-soft">
          <SearchX className="size-6" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <FocusHeading
            id={headingId}
            className="font-display text-xl font-black text-ink sm:text-2xl"
          >
            {notFound.title}
          </FocusHeading>
          <p className="text-sm leading-7 text-body">{notFound.body}</p>
        </div>
      </div>
      <div className="mt-6 rounded-card bg-sunken p-4 sm:p-5">
        <h3 className="text-sm font-bold text-ink">{notFound.tipsTitle}</h3>
        <ol className="mt-3 flex flex-col gap-3">
          {notFound.tips.map((tip, index) => (
            <li key={tip} className="flex items-start gap-3 text-sm leading-7 text-body">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-surface text-xs font-extrabold text-primary ring-1 ring-line">
                {formatNumber(locale, index + 1)}
              </span>
              {tip}
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link
          href={localizePath(locale, routes.serviceRequest)}
          className={buttonVariants({ className: "max-sm:flex-1" })}
        >
          <Wrench className="size-4.5" aria-hidden />
          {notFound.support}
        </Link>
        <Link
          href={localizePath(locale, routes.contact)}
          className={buttonVariants({ variant: "line", className: "max-sm:flex-1" })}
        >
          <MessageCircle className="size-4.5" aria-hidden />
          {notFound.contact}
        </Link>
      </div>
    </article>
  );
}

export function RateLimitedResult({ locale, content, headingId }: MissResultProps) {
  const { rateLimited } = content;

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 panel border-warning/40 bg-warning-soft/60 p-5 sm:flex-row sm:items-start sm:p-7"
    >
      <span className="icon-tile size-12 rounded-field bg-warning text-white dark:text-night">
        <Clock className="size-6" aria-hidden />
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <FocusHeading id={headingId} className="font-display text-xl font-black text-ink">
          {rateLimited.title}
        </FocusHeading>
        <p className="text-sm leading-7 text-body">{rateLimited.body}</p>
        <Link
          href={localizePath(locale, routes.support)}
          className={buttonVariants({
            variant: "ghost",
            size: "sm",
            className: "-ms-3.5 self-start",
          })}
        >
          {rateLimited.support}
        </Link>
      </div>
    </article>
  );
}

interface FailedResultProps {
  content: WarrantyContent;
  headingId: string;
  onRetry: () => void;
}

export function FailedResult({ content, headingId, onRetry }: FailedResultProps) {
  const { failed } = content;

  return (
    <article
      aria-labelledby={headingId}
      className="flex flex-col gap-4 panel bg-raised p-5 shadow-card sm:flex-row sm:items-start sm:p-7"
    >
      <span className="icon-tile size-12 rounded-field bg-chip text-ink-soft">
        <CloudOff className="size-6" aria-hidden />
      </span>
      <div className="flex flex-1 flex-col gap-1.5">
        <FocusHeading id={headingId} className="font-display text-xl font-black text-ink">
          {failed.title}
        </FocusHeading>
        <p className="text-sm leading-7 text-body">{failed.body}</p>
        <Button variant="line" size="sm" onClick={onRetry} className="mt-2 self-start">
          <RotateCw className="size-4" aria-hidden />
          {failed.retry}
        </Button>
      </div>
    </article>
  );
}
