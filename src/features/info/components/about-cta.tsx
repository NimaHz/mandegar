import { ArrowLeft, BriefcaseBusiness, Handshake, Ship } from "lucide-react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo-mark";
import type { Locale } from "@/i18n/config";
import { localizePath } from "@/i18n/paths";
import { routes } from "@/lib/routes";
import type { ContactDepartment } from "@/types/support";

import { aboutContent } from "../content";

const icons: Partial<Record<ContactDepartment, typeof Handshake>> = {
  partnership: Handshake,
  export: Ship,
  general: BriefcaseBusiness,
};

export function AboutCta({ locale }: { locale: Locale }) {
  const { cta } = aboutContent[locale];

  return (
    <section aria-labelledby="about-cta" className="container-page">
      <div className="relative isolate grid gap-10 overflow-hidden rounded-panel bg-brand-deep p-6 text-white shadow-lift ring-1 ring-white/10 ring-inset sm:p-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-14 lg:p-14">
        <LogoMark className="pointer-events-none absolute -start-20 -bottom-24 -z-10 size-80 opacity-[0.08]" />
        <span
          aria-hidden
          className="pointer-events-none absolute -end-28 -top-36 -z-10 size-96 rounded-full bg-primary/45 blur-3xl"
        />
        <div className="flex flex-col gap-3">
          <p className="text-label font-bold text-accent">{cta.eyebrow}</p>
          <h2
            id="about-cta"
            className="font-display text-[1.875rem] leading-snug font-black text-balance sm:text-[2.5rem]"
          >
            {cta.title}
          </h2>
          <p className="max-w-md text-sm leading-7 text-white/75 sm:text-base sm:leading-8">
            {cta.description}
          </p>
        </div>
        <ul className="grid gap-3">
          {cta.links.map((link) => {
            const Icon = icons[link.department] ?? Handshake;
            return (
              <li key={link.department}>
                <Link
                  href={{
                    pathname: localizePath(locale, routes.contact),
                    query: { department: link.department },
                  }}
                  className="group flex items-center gap-4 rounded-card bg-white/[0.06] p-4 ring-1 ring-white/10 transition-colors duration-300 ring-inset hover:bg-white/[0.12] sm:p-5"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-field bg-white/10 text-primary-glow">
                    <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-base font-extrabold">{link.title}</span>
                    <span className="text-sm leading-6 text-white/70">{link.body}</span>
                  </span>
                  <ArrowLeft
                    className="size-4.5 shrink-0 text-white/60 transition-[translate,color] duration-300 group-hover:-translate-x-1 group-hover:text-white ltr:rotate-180 ltr:group-hover:translate-x-1"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
