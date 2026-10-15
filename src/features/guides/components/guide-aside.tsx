import { ArrowLeft, Hammer, MapPin, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { phoneHref } from "@/features/support/phone-href";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { GuideDetail, SiteSettings } from "@/types/content";

import type { GuidesContent } from "../content";
import { GuideProgress } from "./guide-progress";

interface GuideAsideProps {
  locale: Locale;
  guide: GuideDetail;
  phone: SiteSettings["phones"][number] | undefined;
  copy: GuidesContent["detail"];
}

const arrowClass =
  "size-4 shrink-0 text-muted transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:text-primary ltr:rotate-180 ltr:group-hover:translate-x-0.5";

export function GuideAside({ locale, guide, phone, copy }: GuideAsideProps) {
  return (
    <aside className="flex flex-col gap-4 lg:sticky lg:top-28">
      {guide.steps.length > 0 && (
        <GuideProgress slug={guide.slug} total={guide.steps.length} copy={copy.steps} />
      )}

      {guide.safety.length > 0 && (
        <section
          aria-labelledby="guide-safety-title"
          className="rounded-card border border-warning/40 bg-warning-soft/70 p-5"
        >
          <h2
            id="guide-safety-title"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-warning"
          >
            <ShieldAlert className="size-4.5" aria-hidden />
            {copy.safety}
          </h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {guide.safety.map((note) => (
              <li key={note} className="flex items-start gap-2.5 text-sm leading-7 text-ink">
                <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-warning" />
                {note}
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide.tools.length > 0 && (
        <section aria-labelledby="guide-tools-title" className="card bg-raised p-5">
          <h2
            id="guide-tools-title"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-ink"
          >
            <Hammer className="size-4.5 text-primary" aria-hidden />
            {copy.tools}
          </h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {guide.tools.map((tool) => (
              <li
                key={tool}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-soft"
              >
                {tool}
              </li>
            ))}
          </ul>
        </section>
      )}

      {guide.products.length > 0 && (
        <section aria-labelledby="guide-products-title" className="card bg-raised p-5">
          <h2 id="guide-products-title" className="text-sm font-extrabold text-ink">
            {copy.products}
          </h2>
          <ul className="-mx-2 mt-2 flex flex-col">
            {guide.products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={localizePath(locale, routes.product(product.slug))}
                  className="group flex items-center gap-3 rounded-control px-2 py-2 transition-colors hover:bg-surface"
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-semibold text-ink group-hover:text-primary">
                      {product.name}
                    </span>
                    <bdi
                      dir="ltr"
                      className="self-start font-code text-caption font-bold text-muted"
                    >
                      {product.modelCode}
                    </bdi>
                  </span>
                  <ArrowLeft className={arrowClass} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section
        aria-labelledby="guide-help-title"
        className="rounded-card bg-brand-deep p-5 text-white"
      >
        <h2 id="guide-help-title" className="font-display text-lg font-black">
          {copy.help.title}
        </h2>
        <p className="mt-1.5 text-sm leading-7 text-white/75">{copy.help.body}</p>
        <div className="mt-4 flex flex-col gap-2">
          <Link
            href={localizePath(locale, routes.serviceRequest)}
            className={buttonVariants({ variant: "inverse", block: true })}
          >
            {copy.help.request}
          </Link>
          {phone && (
            <a
              href={phoneHref(phone.value)}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-control text-sm font-bold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
            >
              <Phone className="size-4 text-accent" aria-hidden />
              {copy.help.call}
              <bdi dir="ltr" className="font-code text-xs text-white/80">
                {phone.value}
              </bdi>
            </a>
          )}
          <Link
            href={localizePath(locale, routes.serviceCenters)}
            className="inline-flex h-10 items-center justify-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            <MapPin className="size-4" aria-hidden />
            {copy.help.centers}
          </Link>
        </div>
      </section>
    </aside>
  );
}
