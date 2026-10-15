import { ClipboardList, LifeBuoy, PhoneCall, ScanSearch } from "lucide-react";
import Link from "next/link";

import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Locale } from "@/i18n/config";
import { fill } from "@/i18n/fill";
import { localizePath } from "@/i18n/paths";
import { formatNumber } from "@/lib/format";
import { routes } from "@/lib/routes";

import { homeContent } from "../content";

const stepIcons = [ClipboardList, ScanSearch, PhoneCall] as const;

export function ServiceJourney({ locale }: { locale: Locale }) {
  const content = homeContent[locale].journey;

  return (
    <section aria-labelledby="home-journey" className="container-page section-y">
      <div className="relative isolate overflow-hidden panel bg-raised px-5 py-10 shadow-card sm:px-10 lg:px-14 lg:py-14">
        <span
          aria-hidden
          className="absolute -end-24 -top-24 -z-10 size-72 rounded-full bg-primary-soft blur-2xl"
        />
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="home-journey"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />
          <div className="flex flex-wrap gap-3">
            <Link
              href={localizePath(locale, routes.serviceRequest)}
              className={buttonVariants({ size: "lg" })}
            >
              <LifeBuoy className="size-5" aria-hidden />
              {content.request}
            </Link>
            <Link
              href={localizePath(locale, routes.track)}
              className={buttonVariants({ variant: "line", size: "lg" })}
            >
              <ScanSearch className="size-5" aria-hidden />
              {content.track}
            </Link>
          </div>
        </div>
        <RevealGroup className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-6 lg:mt-14">
          <span
            aria-hidden
            className="absolute inset-x-[16%] top-7 hidden h-px border-t-2 border-dashed border-line-strong md:block"
          />
          {content.steps.map((step, index) => {
            const Icon = stepIcons[index] ?? ClipboardList;
            return (
              <RevealItem
                key={step.title}
                className="relative flex gap-4 md:flex-col md:items-center md:text-center"
              >
                <span className="relative grid size-14 shrink-0 place-items-center rounded-full bg-primary text-on-primary shadow-primary ring-8 ring-raised">
                  <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="flex flex-col gap-1.5">
                  <p className="text-caption font-bold text-primary">
                    {fill(content.step, { count: formatNumber(locale, index + 1) })}
                  </p>
                  <h3 className="text-lg font-extrabold text-ink">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-7 text-body">{step.body}</p>
                </div>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
