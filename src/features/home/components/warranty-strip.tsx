import { ArrowLeft, LifeBuoy, MapPin, ScanLine, ShieldCheck } from "lucide-react";
import Link from "next/link";

import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { cn } from "@/lib/cn";
import { routes } from "@/lib/routes";

import { homeContent } from "../content";

interface WarrantyStripProps {
  locale: Locale;
  overlap: boolean;
}

export function WarrantyStrip({ locale, overlap }: WarrantyStripProps) {
  const content = homeContent[locale].warranty;

  return (
    <section
      aria-labelledby="warranty-strip-title"
      className={cn("relative z-30 container-page", overlap ? "-mt-6 sm:-mt-8 lg:-mt-14" : "pt-8")}
    >
      <div className="grid grid-cols-1 gap-5 panel bg-raised p-5 shadow-lift sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_auto] lg:items-center lg:gap-8 lg:p-7">
        <div className="flex items-start gap-4">
          <span className="relative grid size-12 shrink-0 place-items-center rounded-field bg-primary text-on-primary shadow-primary">
            <ShieldCheck className="size-6" strokeWidth={1.8} aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h2 id="warranty-strip-title" className="text-lg font-extrabold text-ink">
              {content.title}
            </h2>
            <p className="text-sm leading-6 text-body">{content.description}</p>
          </div>
        </div>

        <form
          action={localizePath(locale, routes.warranty)}
          method="get"
          className="flex flex-col gap-1.5"
        >
          <label htmlFor="home-warranty-code" className="sr-only">
            {content.label}
          </label>
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
            <div className="flex h-13 min-w-0 items-center gap-2.5 field-shell ps-4 pe-3 sm:flex-1">
              <ScanLine className="size-5 shrink-0 text-muted" strokeWidth={1.8} aria-hidden />
              <input
                id="home-warranty-code"
                name="code"
                dir="ltr"
                required
                minLength={9}
                maxLength={14}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                enterKeyHint="search"
                placeholder={content.placeholder}
                aria-describedby="home-warranty-hint"
                className="h-full w-full min-w-0 flex-1 bg-transparent font-code text-lead font-semibold tracking-wider text-ink uppercase outline-none placeholder:font-sans placeholder:tracking-normal placeholder:normal-case rtl:text-end rtl:placeholder:text-end"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-field bg-inverse px-5 text-sm font-bold text-on-inverse transition-colors hover:bg-primary hover:text-on-primary sm:h-13 sm:px-7"
            >
              {content.submit}
              <ArrowLeft className="size-4 ltr:rotate-180" aria-hidden />
            </button>
          </div>
          <p id="home-warranty-hint" className="ps-1 text-xs text-muted">
            {content.hint}
          </p>
        </form>

        <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          <li>
            <Link
              href={localizePath(locale, routes.serviceRequest)}
              className="inline-flex h-10 items-center gap-2 rounded-control px-3 text-label font-bold text-ink transition-colors hover:bg-sunken hover:text-primary"
            >
              <LifeBuoy className="size-4.5 text-primary" strokeWidth={1.9} aria-hidden />
              {content.requestService}
            </Link>
          </li>
          <li>
            <Link
              href={localizePath(locale, routes.serviceCenters)}
              className="inline-flex h-10 items-center gap-2 rounded-control px-3 text-label font-bold text-ink transition-colors hover:bg-sunken hover:text-primary"
            >
              <MapPin className="size-4.5 text-primary" strokeWidth={1.9} aria-hidden />
              {content.findCenter}
            </Link>
          </li>
        </ul>
      </div>
    </section>
  );
}
